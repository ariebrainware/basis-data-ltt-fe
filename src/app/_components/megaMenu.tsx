'use client'
import React from 'react'
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
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
} from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import { SquaresPlusIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import { getUserRole } from '../_functions/userRole'
import { logout } from '../_functions/logout'

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
    title: 'Penanganan',
    description: 'Halaman untuk penanganan pasien',
    icon: HeartIcon,
    url: '/treatment',
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

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const userRole = getUserRole()

  const filteredMenuItems = navListMenuItems.filter((item) =>
    item.roles.includes(userRole || '')
  )

  const renderItems = filteredMenuItems.map(
    ({ icon, title, description, url }, key) => (
      <a href="#" key={key}>
        <MenuItem
          className="flex items-center gap-3 rounded-lg"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onClick={() => {
            window.location.href = url
          }}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
            {' '}
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
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
      >
        {typeof window !== 'undefined' &&
          (userRole === 'super_admin' || userRole === 'therapist') && (
            <MenuHandler>
              <Typography
                as="div"
                variant="small"
                className="font-medium"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                <ListItem
                  className="flex items-center gap-2 py-2 pr-4 font-medium text-gray-900"
                  selected={isMenuOpen || isMobileMenuOpen}
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
                    className={`hidden size-3 transition-transform lg:block ${
                      isMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`block size-3 transition-transform lg:hidden ${
                      isMobileMenuOpen ? 'rotate-180' : ''
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
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  )
}

function NavList() {
  return (
    <List
      className="mb-6 mt-4 p-0 lg:my-0 lg:flex-row lg:p-1"
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
      >
        <ListItem
          className="flex items-center gap-2 py-2 pr-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Home
        </ListItem>
      </Typography>
      <NavListMenu />
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
      >
        <ListItem
          className="flex items-center gap-2 py-2 pr-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onClick={logout}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          Log Out
        </ListItem>
      </Typography>
    </List>
  )
}

export default function MegaMenuDefault() {
  const [openNav, setOpenNav] = React.useState(false)

  React.useEffect(() => {
    window.addEventListener(
      'resize',
      () => window.innerWidth >= 960 && setOpenNav(false)
    )
  }, [])

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
          placeholder={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
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
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
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
