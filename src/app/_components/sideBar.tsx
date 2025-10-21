'use client'
import React from 'react'
import {
  List,
  Card,
  Alert,
  Avatar,
  ListItem,
  Accordion,
  Typography,
  AccordionBody,
  ListItemPrefix,
} from '@material-tailwind/react'
import Image from 'next/image'
import {
  TicketIcon,
  UserGroupIcon,
  Square2StackIcon,
  RectangleGroupIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/solid'
import {
  ChevronDownIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

function SidebarLight() {
  const [open, setOpen] = React.useState(0)
  const [openAlert, setOpenAlert] = React.useState(true)

  const handleOpen = (value: number) => {
    setOpen(open === value ? 0 : value)
  }

  const LIST_ITEM_STYLES =
    'select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900'

  return (
    <Card
      className="mx-auto h-[calc(100vh-2rem)] w-full max-w-80 p-6 shadow-md"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <>
        <Image
          src="https://www.material-tailwind.com/logos/mt-logo.png"
          alt="brand"
          width={36}
          height={36}
          className="size-9"
        />
        <Typography
          color="blue-gray"
          className="text-lg font-bold"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Material Tailwind
        </Typography>
      </>
      <hr className="my-2 border-gray-200" />
      <List
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <Accordion
          open={open === 1}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItem
            selected={open === 1}
            data-selected={open === 1}
            onClick={() => handleOpen(1)}
            className="select-none p-3 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 active:bg-gray-100 active:text-gray-900 data-[selected=true]:text-gray-900"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ListItemPrefix
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <Avatar
                size="sm"
                src="https://www.material-tailwind.com/img/avatar1.jpg"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              />
            </ListItemPrefix>
            <Typography
              className="mr-auto font-normal text-inherit"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Brooklyn Alice
            </Typography>
            <ChevronDownIcon
              strokeWidth={3}
              className={`ml-auto size-4 text-gray-500 transition-transform ${open === 1 ? 'rotate-180' : ''}`}
            />
          </ListItem>
          <AccordionBody className="py-1">
            <List
              className="p-0"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <ListItem
                className={`px-16 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                My Profile
              </ListItem>
              <ListItem
                className={`px-16 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Settings
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <hr className="my-2 border-gray-200" />
        <Accordion
          open={open === 2}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItem
            selected={open === 2}
            data-selected={open === 2}
            onClick={() => handleOpen(2)}
            className="select-none px-3 py-[9px] hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 active:bg-gray-100 active:text-gray-900 data-[selected=true]:text-gray-900"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ListItemPrefix
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <RectangleGroupIcon className="size-5" />
            </ListItemPrefix>
            <Typography
              className="mr-auto font-normal text-inherit"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Dashboard
            </Typography>
            <ChevronDownIcon
              strokeWidth={3}
              className={`ml-auto size-4 text-gray-500 transition-transform ${open === 2 ? 'rotate-180' : ''}`}
            />
          </ListItem>
          <AccordionBody className="py-1">
            <List
              className="p-0"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <ListItem
                className={`px-12 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Analytics
              </ListItem>
              <ListItem
                className={`px-12 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Sales
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <Square2StackIcon className="size-5" />
          </ListItemPrefix>
          Products
        </ListItem>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <TicketIcon className="size-5" />
          </ListItemPrefix>
          Orders
        </ListItem>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <UserGroupIcon className="size-5" />
          </ListItemPrefix>
          Customers
        </ListItem>
      </List>
      <hr className="my-2 border-gray-200" />
      <List
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ChatBubbleLeftEllipsisIcon className="size-5" />
          </ListItemPrefix>
          Help & Support
        </ListItem>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ArrowLeftStartOnRectangleIcon
              strokeWidth={2.5}
              className="size-5"
            />
          </ListItemPrefix>
          Sign Out
        </ListItem>
      </List>
      <Alert open={openAlert} className="mt-auto" color="green" variant="ghost">
        <Typography
          variant="small"
          color="green"
          className="mb-1 font-bold"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          New Version Available
        </Typography>
        <Typography
          variant="small"
          color="green"
          className="font-normal"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Update your app and enjoy the new features and improvements.
        </Typography>
        <div className="mt-4 flex gap-4">
          <Typography
            as="a"
            href="#"
            variant="small"
            color="green"
            className="font-normal"
            onClick={() => setOpenAlert(false)}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Dismiss
          </Typography>
          <Typography
            as="a"
            href="#"
            variant="small"
            color="green"
            className="font-medium"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Upgrade Now
          </Typography>
        </div>
      </Alert>
      <Typography
        variant="small"
        className="mt-5 flex justify-center font-medium text-gray-500"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        mt v2.1.2
      </Typography>
    </Card>
  )
}

function SidebarDark() {
  const [open, setOpen] = React.useState(0)
  const [openAlert, setOpenAlert] = React.useState(true)

  const handleOpen = (value: number) => {
    setOpen(open === value ? 0 : value)
  }

  const LIST_ITEM_STYLES =
    'text-gray-500 hover:text-white focus:text-white active:text-white hover:bg-opacity-20 focus:bg-opacity-20 active:bg-opacity-20'

  return (
    <Card
      color="gray"
      className="mx-auto h-[calc(100vh-2rem)] w-full max-w-xs p-6 shadow-md"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <div className="mb-2 flex items-center gap-4 p-4">
        <Image
          src="https://www.material-tailwind.com/logos/mt-logo.png"
          alt="brand"
          width={36}
          height={36}
          className="size-9"
        />
        <Typography
          className="text-lg font-bold text-gray-300"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Material Tailwind
        </Typography>
      </div>
      <hr className="my-2 border-gray-800" />
      <List
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <Accordion
          open={open === 1}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItem
            selected={open === 1}
            data-selected={open === 1}
            onClick={() => handleOpen(1)}
            className="select-none p-3 text-gray-500 hover:bg-gray-500/20 hover:text-white focus:bg-gray-500/20 focus:text-white active:bg-gray-500/20 active:text-white data-[selected=true]:bg-gray-50/20 data-[selected=true]:text-white"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ListItemPrefix
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <Avatar
                size="sm"
                src="https://www.material-tailwind.com/img/avatar1.jpg"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              />
            </ListItemPrefix>
            <Typography
              className="mr-auto font-normal text-inherit"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Brooklyn Alice
            </Typography>
            <ChevronDownIcon
              strokeWidth={3}
              className={`ml-auto size-4 text-gray-500 transition-transform ${open === 1 ? 'rotate-180' : ''}`}
            />
          </ListItem>
          <AccordionBody className="py-1">
            <List
              className="p-0"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <ListItem
                className={`px-16 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                My Profile
              </ListItem>
              <ListItem
                className={`px-16 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Settings
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <hr className="my-2 border-gray-800" />
        <Accordion
          open={open === 2}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItem
            selected={open === 2}
            data-selected={open === 2}
            onClick={() => handleOpen(2)}
            className="select-none px-3 py-[9px] text-gray-500 hover:bg-gray-500/20 hover:text-white focus:bg-gray-500/20 focus:text-white active:bg-gray-500/20 active:text-white data-[selected=true]:bg-gray-50/20 data-[selected=true]:text-white"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ListItemPrefix
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <RectangleGroupIcon className="size-5" />
            </ListItemPrefix>
            <Typography
              className="mr-auto font-normal text-inherit"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Dashboard
            </Typography>
            <ChevronDownIcon
              strokeWidth={3}
              className={`ml-auto size-4 text-gray-500 transition-transform ${open === 2 ? 'rotate-180' : ''}`}
            />
          </ListItem>
          <AccordionBody className="py-1">
            <List
              className="p-0"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <ListItem
                className={`px-12 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Analytics
              </ListItem>
              <ListItem
                className={`px-12 ${LIST_ITEM_STYLES}`}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                Sales
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <Square2StackIcon className="size-5" />
          </ListItemPrefix>
          Products
        </ListItem>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <TicketIcon className="size-5" />
          </ListItemPrefix>
          Orders
        </ListItem>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <UserGroupIcon className="size-5" />
          </ListItemPrefix>
          Customers
        </ListItem>
      </List>
      <hr className="my-2 border-gray-800" />
      <List
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ChatBubbleLeftEllipsisIcon className="size-5" />
          </ListItemPrefix>
          Help & Support
        </ListItem>
        <ListItem
          className={LIST_ITEM_STYLES}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ListItemPrefix
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ArrowLeftStartOnRectangleIcon
              strokeWidth={2.5}
              className="size-5"
            />
          </ListItemPrefix>
          Sign Out
        </ListItem>
      </List>
      <Alert open={openAlert} className="mt-auto bg-gray-800" variant="ghost">
        <Typography
          variant="small"
          color="white"
          className="mb-1 font-bold"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          New Version Available
        </Typography>
        <Typography
          variant="small"
          color="white"
          className="font-normal"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Update your app and enjoy the new features and improvements.
        </Typography>
        <div className="mt-4 flex gap-4">
          <Typography
            as="a"
            href="#"
            variant="small"
            color="white"
            className="font-normal"
            onClick={() => setOpenAlert(false)}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Dismiss
          </Typography>
          <Typography
            as="a"
            href="#"
            variant="small"
            color="white"
            className="font-medium"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Upgrade Now
          </Typography>
        </div>
      </Alert>
      <Typography
        variant="small"
        className="mt-5 flex justify-center font-medium text-gray-400"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      >
        mt v2.1.2
      </Typography>
    </Card>
  )
}

export default function SideBar() {
  return (
    <section className="grid place-items-center">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <SidebarLight />
        <SidebarDark />
      </div>
    </section>
  )
}
