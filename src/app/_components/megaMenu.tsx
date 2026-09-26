'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Navbar,
  Collapse,
  Typography as RawTypography,
  IconButton as RawIconButton,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from '@material-tailwind/react'
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  CubeIcon,
  BanknotesIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import { SquaresPlusIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import { useUserRole } from '../_functions/userRole'
import { useUserName, setUserName } from '../_functions/userName'
import { fetchUserProfile } from '../_functions/profileService'
import { logout } from '../_functions/logout'

// Workaround: Material Tailwind's `Typography` props typing requires many
// event-related props in every usage. Cast to `any` so we can use the
// component without passing a long list of `undefined` props.
const Typography: any = RawTypography
const IconButton: any = RawIconButton

const navListMenuItems = [
  {
    title: 'Pasien',
    description: 'Halaman untuk manajemen pasien',
    icon: SquaresPlusIcon,
    url: '/patient',
    roles: ['super_admin'],
  },
  {
    title: 'Terapis',
    description: 'Halaman manajemen terapis',
    icon: UserGroupIcon,
    url: '/therapist',
    roles: ['super_admin'],
  },
  {
    title: 'Karyawan',
    description: 'Halaman manajemen karyawan',
    icon: UserGroupIcon,
    url: '/employee',
    roles: ['super_admin'],
  },
  {
    title: 'Penyakit',
    description: 'Halaman manajemen penyakit',
    icon: DocumentTextIcon,
    url: '/disease',
    roles: ['super_admin'],
  },
  {
    title: 'Penanganan',
    description: 'Halaman untuk penanganan pasien',
    icon: HeartIcon,
    url: '/treatment',
    roles: ['super_admin'],
  },
  {
    title: 'Harga',
    description: 'Halaman manajemen harga layanan',
    icon: CurrencyDollarIcon,
    url: '/pricing',
    roles: ['super_admin'],
  },
  {
    title: 'Item',
    description: 'Halaman manajemen item',
    icon: CubeIcon,
    url: '/item',
    roles: ['super_admin'],
  },
  {
    title: 'Transaksi',
    description: 'Halaman transaksi (hanya ubah data)',
    icon: ReceiptPercentIcon,
    url: '/transaction',
    roles: ['super_admin'],
  },
  {
    title: 'Pengeluaran',
    description: 'Halaman manajemen pengeluaran',
    icon: BanknotesIcon,
    url: '/expense',
    roles: ['super_admin'],
  },
  {
    title: 'Penanganan Terapis',
    description: 'Lihat dan lengkapi penanganan pasien',
    icon: HeartIcon,
    url: '/therapist/treatment',
    roles: ['therapist'],
  },
]

function formatRoleLabel(role: string | null): string {
  if (!role) return 'Pengguna'
  const lower = role.toLowerCase().trim()
  if (lower === 'super_admin' || lower === 'admin') return 'Super Admin'
  if (lower === 'therapist') return 'Terapis'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const userRole = useUserRole()
  const router = useRouter()

  const filteredMenuItems = navListMenuItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  )

  const renderItems = filteredMenuItems.map(
    ({ icon, title, description, url }, key) => (
      <a
        href="#"
        key={key}
        onClick={(e) => {
          e.preventDefault()
          router.push(url)
        }}
      >
        <MenuItem
          className="flex items-center gap-3 rounded-lg"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2">
            {React.createElement(icon, {
              strokeWidth: 2,
              className: 'h-6 text-gray-900 w-6',
            })}
          </div>
          <div>
            <Typography
              variant="h6"
              color="blue-gray"
              className="flex items-center text-sm font-bold"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              {title}
            </Typography>
            <Typography
              variant="paragraph"
              className="text-xs !font-medium text-blue-gray-500"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              {description}
            </Typography>
          </div>
        </MenuItem>
      </a>
    )
  )

  return (
    <React.Fragment>
      {/* Desktop Menu */}
      <div className="hidden lg:block">
        <Menu
          open={isMenuOpen}
          handler={setIsMenuOpen}
          offset={{ mainAxis: 20 }}
          placement="bottom"
        >
          {(userRole === 'super_admin' || userRole === 'therapist') && (
            <MenuHandler>
              <Typography as="div" variant="small" className="font-medium">
                <ListItem
                  className="flex items-center gap-2 py-2 pr-4 font-medium text-gray-900"
                  selected={isMenuOpen}
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  Menu
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`hidden size-3 transition-transform lg:block ${
                      isMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </ListItem>
              </Typography>
            </MenuHandler>
          )}
          <MenuList
            className="hidden max-w-screen-xl rounded-xl lg:block"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <ul className="grid grid-cols-3 gap-y-2 outline-none outline-0">
              {renderItems}
            </ul>
          </MenuList>
        </Menu>
      </div>

      {/* Mobile Menu */}
      <div className="block lg:hidden">
        {(userRole === 'super_admin' || userRole === 'therapist') && (
          <Typography as="div" variant="small" className="font-medium">
            <ListItem
              className="flex items-center gap-2 py-2 pr-4 font-medium text-gray-900"
              selected={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Menu
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block size-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </ListItem>
          </Typography>
        )}
        {isMobileMenuOpen && (
          <div className="flex flex-col gap-1 pl-4">{renderItems}</div>
        )}
      </div>
    </React.Fragment>
  )
}

function NavList() {
  const router = useRouter()
  const userName = useUserName()
  const userRole = useUserRole()
  const roleLabel = formatRoleLabel(userRole)
  const displayName = userName?.trim() || roleLabel

  return (
    <List
      className="mb-6 mt-4 p-0 lg:my-0 lg:flex-row lg:items-center lg:gap-1 lg:p-1"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <Typography
        as="a"
        href="#"
        variant="small"
        color="blue-gray"
        className="font-medium"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          router.push('/dashboard')
        }}
      >
        <ListItem
          className="flex items-center gap-2 py-2 pr-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <HomeIcon className="size-4 text-blue-gray-600" />
          Home
        </ListItem>
      </Typography>

      <NavListMenu />

      {/* Single Personalized Logged-in User Profile Button */}
      <Typography
        as="div"
        variant="small"
        className="my-1 lg:my-0"
        placeholder={undefined}
      >
        <button
          data-testid="nav-user-profile"
          onClick={() => router.push('/profile')}
          className="group flex items-center gap-2 rounded-full border border-blue-gray-100 bg-blue-gray-50/70 px-3 py-1.5 text-left transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/80"
          title="Lihat Profil"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              data-testid="nav-username"
              className="max-w-[130px] truncate text-xs font-semibold text-blue-gray-800 group-hover:text-indigo-700 md:max-w-[170px]"
            >
              {displayName}
            </span>
            <span className="text-xs font-medium text-blue-gray-300">·</span>
            <span className="text-xs font-medium text-indigo-600">Profile</span>
          </div>
          <span className="hidden rounded-full bg-indigo-100/80 px-2 py-0.5 text-[10px] font-medium text-indigo-700 sm:inline-block">
            {roleLabel}
          </span>
        </button>
      </Typography>

      {/* Single Log Out Button */}
      <Typography
        as="a"
        href="#"
        variant="small"
        color="blue-gray"
        className="font-medium"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
        onClick={async (e: React.MouseEvent) => {
          e.preventDefault()
          await logout()
          router.replace('/login')
        }}
      >
        <ListItem
          className="flex items-center gap-2 py-2 pr-4 hover:text-red-600"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <ArrowRightOnRectangleIcon className="size-4 text-blue-gray-600" />
          Log Out
        </ListItem>
      </Typography>
    </List>
  )
}

export default function MegaMenuDefault() {
  const router = useRouter()
  const [openNav, setOpenNav] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Defer mounted flag to avoid synchronous setState inside effect
    const t = setTimeout(() => {
      setMounted(true)
      // Check if user-name is not in cache yet
      if (
        !localStorage.getItem('user-name') &&
        localStorage.getItem('session-token')
      ) {
        const USER_ENDPOINT =
          process.env.NEXT_PUBLIC_CURRENT_USER_ENDPOINT || '/user'
        fetchUserProfile({ endpoint: USER_ENDPOINT, router })
          .then((res: any) => {
            if (res && res.name) {
              setUserName(res.name)
            }
          })
          .catch(() => {})
      }
    }, 0)
    const onResize = () => window.innerWidth >= 960 && setOpenNav(false)
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [router])

  return (
    <Navbar
      className="mx-auto max-w-screen-xl px-4 py-2"
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
    >
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="#"
          variant="h6"
          className="mr-4 cursor-pointer py-1.5 lg:ml-2"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            router.push('/dashboard')
          }}
        >
          Lee Tit Tar Dashboard
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          className="lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="size-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="size-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <NavList />
      </Collapse>
    </Navbar>
  )
}
