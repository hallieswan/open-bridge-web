import {
  Drawer,
  IconButton,




  makeStyles
} from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SomeIcon from '@material-ui/icons/SentimentVerySatisfied'
import clsx from 'clsx'
import React, { FunctionComponent } from 'react'
import { NavLink } from 'react-router-dom'
import { poppinsFont, ThemeType } from '../../style/theme'
import { SECTIONS as sectionLinks, StudySection } from './sections'

const drawerWidth = 212
const useStyles = makeStyles((theme: ThemeType) => ({
  root: {
    margin: 0,
    padding: 0,
    listStyle: 'none',

    '& li': {
      padding: '10px 0',
      fontSize: 18,
    },
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(6),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(6),
    },
  },
  list: {
    margin: '0',
    padding: '0',
    position: 'relative',
    listStyle: 'none',
  },

  listItem: {
    color: theme.palette.action.active,
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),

    '&$listItemActive': {
      borderLeft: '4px solid #BCD5E4',
      backgroundColor: '#FAFAFA',
      paddingLeft: theme.spacing(1.5),
    },
    '&$listItemCollapsed': {
      paddingLeft: theme.spacing(1),
    },
    '&$listItemActive&$listItemCollapsed': {
      paddingLeft: theme.spacing(0.5),
    },
  },
  listItemActive: {},
  listItemCollapsed: {},

  link: {
    fontFamily: poppinsFont,
    color: '#282828',
    textDecoration: 'none',
    /*  color: theme.palette.action.active,
    paddingLeft: theme.spacing(8),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),*/
  },
  drawerPaper: {
    fontSize: '14px',
    position: 'static',
    border: 'none',

    backgroundColor: '#F2F2F2',
    boxShadow:
      '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
  },
}))

type StudyLeftNavOwnProps = {
  currentSection?: StudySection
  id?: string
  open: boolean
  onToggle: Function
}

type StudyLeftNavProps = StudyLeftNavOwnProps

const StudyLeftNav: FunctionComponent<StudyLeftNavProps> = ({
  id,
  open,
  onToggle,
  currentSection = 'sessions-creator',
}) => {
  const classes = useStyles()
  //const [open, setOpen] = React.useState(false)

  const toggleDrawer = () => {
    //setOpen(prev => !prev)
    onToggle()
  }

  return (
    <Drawer
      variant="permanent"
      elevation={1}
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx(classes.drawerPaper, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
    >
      <div
        style={{
          textAlign: 'right',
          height: '48px',
          backgroundColor: '#FAFAFA',
        }}
      >
        <IconButton
          onClick={toggleDrawer}
          style={{ borderRadius: 0, width: '48px', height: '100%' }}
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </div>
      <ul className={classes.list}>
        {sectionLinks.map((sectionLink, index) => (
          <li
          key={sectionLink.path}
            className={clsx(classes.listItem, {
              [classes.listItemActive]: sectionLink.path === currentSection,
              [classes.listItemCollapsed]: !open,
            })}
          >
            <NavLink
              key={sectionLink.path}
              to={sectionLink.path}
              className={classes.link}
            >
              <div style={{ display: 'flex' }}>
                <SomeIcon style={{ marginRight: '16px' }} />
                <span>{sectionLink.name}</span>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
    </Drawer>
  )
}

export default StudyLeftNav
