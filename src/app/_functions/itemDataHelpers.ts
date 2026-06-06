import { ItemType } from '../_types/item'

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getItemName(item: any): string {
  return String(item?.name ?? item?.item_name ?? item?.title ?? '')
}

function getItemId(item: any): number {
  return toNumber(item?.ID ?? item?.id)
}

function getItemPrice(item: any): number {
  return toNumber(item?.price ?? item?.amount ?? item?.nominal)
}

function getItemQuantity(item: any): number {
  return toNumber(item?.quantity ?? item?.qty ?? item?.stock)
}

export function normalizeItem(item: any): ItemType {
  return {
    ID: getItemId(item),
    name: getItemName(item),
    price: getItemPrice(item),
    quantity: getItemQuantity(item),
  }
}

export function buildItemQueryParams(
  currentPage: number,
  keyword: string
): string {
  const limit = 100
  const offset = (currentPage - 1) * limit
  let params = `limit=${limit}&offset=${offset}`

  if (keyword.trim() !== '') {
    params += `&keyword=${encodeURIComponent(keyword)}`
  }

  return params
}

export function extractItemList(responseData: any): ItemType[] {
  const rawArray =
    responseData?.data?.items ??
    responseData?.data?.item ??
    responseData?.data ??
    []

  return Array.isArray(rawArray) ? rawArray.map(normalizeItem) : []
}

export function getItemTotal(responseData: any): number {
  return responseData?.data?.total ?? responseData?.total ?? 0
}
