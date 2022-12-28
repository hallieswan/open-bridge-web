import BackToBeginningIcon from '@assets/participants/paging/back_to_beginning_icon.svg'
import ForwardToEndIcon from '@assets/participants/paging/forward_to_end_icon.svg'
import NextPageIcon from '@assets/participants/paging/next_page_icon.svg'
import PreviousPageIcon from '@assets/participants/paging/previous_page_icon.svg'
import {Button} from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import React from 'react'
import PageBox from './PageBox'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  image: {
    width: '10px',
    height: '10px',
  },
  button: {
    width: '10px',
    minWidth: '5px',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}))

export type PageSelectorValues = 'FF' | 'F' | 'B' | 'BB'

type PageSelectorProps = {
  onPageSelected: Function
  currentPageSelected: number
  numberOfPages: number
  handlePageNavigationArrowPressed: Function
}

const PageSelector: React.FunctionComponent<PageSelectorProps> = ({
  onPageSelected,
  currentPageSelected,
  numberOfPages,
  handlePageNavigationArrowPressed,
}) => {
  const classes = useStyles()
  const pageNumbers = []
  for (let i = 1; i <= numberOfPages; i++) {
    pageNumbers.push(i)
  }

  const rotateAndDisableBackIcons = currentPageSelected === 0
  const rotateAndDisableForwardIcons = currentPageSelected + 1 === numberOfPages || numberOfPages === 0

  return (
    <div className={classes.container}>
      <Button
        onClick={() => handlePageNavigationArrowPressed('BB')}
        classes={{root: classes.button}}
        disabled={rotateAndDisableBackIcons}
        id="back-to-beginning-button">
        <img
          src={rotateAndDisableBackIcons ? BackToBeginningIcon : ForwardToEndIcon}
          className={classes.image}
          alt="back_to_beginning_icon"
          style={{
            transform: rotateAndDisableBackIcons ? '' : 'rotate(180deg)',
          }}></img>
      </Button>
      <Button
        onClick={() => handlePageNavigationArrowPressed('B')}
        classes={{root: classes.button}}
        disabled={rotateAndDisableBackIcons}
        id="back-one-page-button">
        <img
          src={rotateAndDisableBackIcons ? PreviousPageIcon : NextPageIcon}
          className={classes.image}
          alt="back_icon"
          style={{
            transform: rotateAndDisableBackIcons ? '' : 'rotate(180deg)',
          }}></img>
      </Button>
      {/* show first 3 then ... */}
      {/* show current with padding of  3 then ...*/}
      {/* show last 3.*/}
      {pageNumbers.map((element, index) => (
        <PageBox
          key={`page-box-${index}`}
          isSelected={index === currentPageSelected}
          pageNumber={element}
          onPageSelected={onPageSelected}
          index={index}
        />
      ))}

      <Button
        onClick={() => handlePageNavigationArrowPressed('F')}
        classes={{root: classes.button}}
        disabled={rotateAndDisableForwardIcons}
        id="forward-one-page-button">
        <img
          src={rotateAndDisableForwardIcons ? PreviousPageIcon : NextPageIcon}
          className={classes.image}
          alt="previous_page_icon"
          style={{
            transform: rotateAndDisableForwardIcons ? 'rotate(180deg)' : '',
          }}></img>
      </Button>
      <Button
        onClick={() => {
          handlePageNavigationArrowPressed('FF')
        }}
        classes={{root: classes.button}}
        disabled={rotateAndDisableForwardIcons}
        id="forward-to-end-button">
        <img
          src={rotateAndDisableForwardIcons ? BackToBeginningIcon : ForwardToEndIcon}
          className={classes.image}
          alt="forward_to_end_icon"
          style={{
            transform: rotateAndDisableForwardIcons ? 'rotate(180deg)' : '',
          }}></img>
      </Button>
    </div>
  )
}

export default PageSelector
