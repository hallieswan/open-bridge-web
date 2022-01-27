import {ReactComponent as CollapseIcon} from '@assets/collapse.svg'
import DownloadIcon from '@assets/download_icon.svg'
import BatchEditIcon from '@assets/edit_pencil_red.svg'
import {ReactComponent as AddParticipantsIcon} from '@assets/participants/add_participants.svg'
import {ReactComponent as AddTestParticipantsIcon} from '@assets/participants/add_test_participants.svg'
import DownloadAppIcon from '@assets/participants/download_app_icon.svg'
import SMSPhoneImg from '@assets/participants/joined_phone_icon.svg'
import ParticipantListFocusIcon from '@assets/participants/participant_list_focus_icon.svg'
import ParticipantListUnfocusIcon from '@assets/participants/participant_list_unfocus_icon.svg'
import {ReactComponent as PinkSendSMSIcon} from '@assets/participants/send_sms_link_pink_icon.svg'
import TestAccountFocusIcon from '@assets/participants/test_account_focus_icon.svg'
import TestAccountUnfocusIcon from '@assets/participants/test_account_unfocus_icon.svg'
import {ReactComponent as UnderConstructionCone} from '@assets/participants/under_construction_cone.svg'
import {ReactComponent as UnderConstructionGirl} from '@assets/participants/under_construction_girl.svg'
import WithdrawnParticipantsFocusIcon from '@assets/participants/withdrawn_participants_focus_icon.svg'
import WithdrawnParticipantsUnfocusIcon from '@assets/participants/withdrawn_participants_unfocus_icon.svg'
import {ReactComponent as DeleteIcon} from '@assets/trash.svg'
import {useStudy} from '@components/studies/studyHooks'
import CollapsibleLayout from '@components/widgets/CollapsibleLayout'
import DialogTitleWithClose from '@components/widgets/DialogTitleWithClose'
import TablePagination from '@components/widgets/pagination/TablePagination'
import NonDraftHeaderFunctionComponent from '@components/widgets/StudyIdWithPhaseImage'
import {
  DialogButtonPrimary,
  DialogButtonSecondary,
} from '@components/widgets/StyledComponents'
import {useAsync} from '@helpers/AsyncHook'
import {useUserSessionDataState} from '@helpers/AuthContext'
import Utility from '@helpers/utility'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Tab,
  Tabs,
} from '@material-ui/core'
import EventService from '@services/event.service'
import ParticipantService from '@services/participants.service'
import StudyService from '@services/study.service'
import {theme} from '@style/theme'
import constants from '@typedefs/constants'
import {
  ExtendedError,
  ExtendedParticipantAccountSummary,
  ParticipantAccountSummary,
  ParticipantActivityType,
  ParticipantEvent,
  RequestStatus,
  SelectionType,
} from '@typedefs/types'
import clsx from 'clsx'
import React, {FunctionComponent} from 'react'
import {useErrorHandler} from 'react-error-boundary'
import {RouteComponentProps, useParams} from 'react-router-dom'
import {useEvents} from '../eventHooks'
import { useParticipants, useUpdateParticipantInList } from '../participantHooks'
import AddParticipants from './add/AddParticipants'
import CsvUtility from './csv/csvUtility'
import ParticipantDownloadTrigger from './csv/ParticipantDownloadTrigger'
import DialogContents from './DialogContents'
import ParticipantTableGrid from './grid/ParticipantTableGrid'
import BatchEditForm from './modify/BatchEditForm'
import ParticipantManagerPlaceholder from './ParticipantManagerPlaceholder'
import useStyles from './ParticipantManager_style'
import ParticipantSearch from './ParticipantSearch'
import ParticipantUtility from './participantUtility'
import WithdrawnTabNoParticipantsPage from './WithdrawnTabNoParticipantsPage'

/** types and constants  */
type ParticipantData = {
  items: ExtendedParticipantAccountSummary[]
  total: number
}

type SelectedParticipantIdsType = {
  ACTIVE: string[]
  TEST: string[]
  WITHDRAWN: string[]
}

const TAB_DEFs = [
  {type: 'ACTIVE', label: 'Participant List'},
  {type: 'WITHDRAWN', label: 'Withdrawn Participants'},
  {type: 'TEST', label: 'Test Accounts'},
]

const TAB_ICONS_FOCUS = [
  ParticipantListFocusIcon,
  WithdrawnParticipantsFocusIcon,
  TestAccountFocusIcon,
]
const TAB_ICONS_UNFOCUS = [
  ParticipantListUnfocusIcon,
  WithdrawnParticipantsUnfocusIcon,
  TestAccountUnfocusIcon,
]

/***  subcomponents  */
const UnderConstructionSC: FunctionComponent = () => (
  <Container maxWidth="md" fixed style={{minHeight: '90vh'}}>
    <Box textAlign="center" my={7}>
      <UnderConstructionCone />
      <Box lineHeight="21px" py={5}>
        <p>Sorry this page is under construction.</p>
        <p> We are working on making it available soon.</p>
      </Box>
      <UnderConstructionGirl />
    </Box>
  </Container>
)

const AddTestParticipantsIconSC: FunctionComponent<{title: string}> = ({
  title,
}) => {
  const classes = useStyles()
  return (
    <div className={classes.addParticipantIcon}>
      <AddTestParticipantsIcon title={title} />
    </div>
  )
}
const GoToDownloadPageLinkSC: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <Button
      href="/app-store-download"
      target="_blank"
      aria-label="downloadApp"
      className={classes.downloadPageLinkButton}>
      <img src={DownloadAppIcon} style={{marginRight: '10px'}}></img> App
      Download Link
    </Button>
  )
}

/*** main component */

type ParticipantManagerOwnProps = {
  title?: string
  paragraph?: string
  studyId?: string
}

type ParticipantManagerProps = ParticipantManagerOwnProps & RouteComponentProps

const ParticipantManager: FunctionComponent<ParticipantManagerProps> = () => {
  let {id: studyId} = useParams<{
    id: string
  }>()

  const {token} = useUserSessionDataState()
  const {
    data: study,
    error: studyError,
    isLoading: isStudyLoading,
  } = useStudy(studyId)

  const handleError = useErrorHandler()
  const classes = useStyles()

  // The current page in the particpant grid the user is viewing
  const [currentPage, setCurrentPage] = React.useState(1)
  // The current page size of the particpant grid
  const [pageSize, setPageSize] = React.useState(25)
  // Withdrawn or active participants
  const [tab, setTab] = React.useState<ParticipantActivityType>('ACTIVE')
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isBatchEditOpen, setIsBatchEditOpen] = React.useState(false)
  const [loadingIndicators, setLoadingIndicators] = React.useState<{
    isDeleting?: boolean
    isDownloading?: boolean
  }>({})
  // Should delete dialog be open
  const [dialogState, setDialogState] = React.useState({
    dialogOpenRemove: false,
    dialogOpenSMS: false,
  })

  // True if the user is currently searching for a particpant using id
  const [isUserSearchingForParticipant, setIsUserSearchingForParticipant] =
    React.useState(false)

  const [fileDownloadUrl, setFileDownloadUrl] = React.useState<
    string | undefined
  >(undefined)

  //user ids selectedForSction
  const [selectedParticipantIds, setSelectedParticipantIds] =
    React.useState<SelectedParticipantIdsType>({
      ACTIVE: [],
      TEST: [],
      WITHDRAWN: [],
    })
  const [isAllSelected, setIsAllSelected] = React.useState(false)

  //List of participants errored out during operation - used for deltee
  const [participantsWithError, setParticipantsWithError] = React.useState<
    ParticipantAccountSummary[]
  >([])

  //trigger data refresh on updates
  const [refreshParticipantsToggle, setRefreshParticipantsToggle] =
    React.useState(false)

  const {data: scheduleEvents = [], error: eventError} = useEvents(studyId)

  // const {
  //   data,
  //   status,
  //   error,
  //   run,
  //   setData: setParticipantData,
  // } = useAsync<ParticipantData>({
  //   status: 'PENDING',
  //   data: null,
  // })
  // console.log("DATA",data?.items)

  const {data: data, error : participantError, status: status} = useParticipants(study?.identifier,currentPage,pageSize,tab)
  
  const {    
    mutate,
    isSuccess,
    isError,
    isLoading: isParticipantUpdating,
  } = useUpdateParticipantInList()
  
  const [curStatus, setCurStatus] = React.useState<RequestStatus>('PENDING')
  // console.log("data", curStatus)

  React.useEffect(()=>{
    if(isParticipantUpdating || status ==='loading') setCurStatus('PENDING')
    else if(isError) setCurStatus('REJECTED')
    else setCurStatus('RESOLVED')
  },[isParticipantUpdating, status])
  
  const onAction = async (
    studyId:string,
    type:'WITHDRAW' | 'DELETE' | 'UPDATE', 
    currentPage?: number, 
    pageSize?: number, 
    tab?: ParticipantActivityType,
    userId?:string,  
    note?: string, 
    updatedFields?: any,
    customEvents?: ParticipantEvent[]
    ) => {

    switch(type){
      case 'WITHDRAW':
        await mutate({
          action: type, 
          studyId, 
          userId, 
          note,
          currentPage,
          pageSize,
          tab})
        setRefreshParticipantsToggle(prev => !prev)
        return
      case 'DELETE':
        setLoadingIndicators(_ => ({isDeleting: true}))

        for(let i = 0; i < selectedParticipantIds[tab!].length; i++){
          await mutate({
            action: type, 
            studyId,
            userId: selectedParticipantIds[tab!][i],
            currentPage,
            pageSize,
            tab})
        }
        setLoadingIndicators(_ => ({isDeleting: false}))
        setDialogState({dialogOpenRemove: false, dialogOpenSMS: false})
        setRefreshParticipantsToggle(prev => !prev)
        return
      case 'UPDATE':
        await mutate({
          action:type, 
          studyId:studyId, 
          userId:userId,
          currentPage:currentPage,
          pageSize:pageSize,
          tab:tab,
          updatedFields:updatedFields,
          customEvents:customEvents })
        setRefreshParticipantsToggle(prev=>!prev)
        return
      default:{
        console.log('unknown participant action')
      }
    }
  }

  // React.useEffect(() => {
  //   if (!study?.identifier) {
  //     return
  //   }
  //   const fn = async () => {
  //     const result: ParticipantData = await run(
  //       ParticipantUtility.getParticipants(
  //         study.identifier,
  //         currentPage,
  //         pageSize,
  //         tab,
  //         token!
  //       )
  //     )
  //   }
  //   fn()
  // }, [study?.identifier, refreshParticipantsToggle, currentPage, pageSize, tab])

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: any) => {
    setTab(newValue)
    setCurrentPage(1)
    setIsAllSelected(false)
  }

  React.useEffect(() => {
    if (isAllSelected) {
      setSelectedParticipantIds(prev => ({
        ...prev,
        [tab]: data?.items?.map(p => p.id) || [],
      }))
    } else {
      setSelectedParticipantIds(prev => ({...prev}))
    }
  }, [data])

  if (!study) {
    return isStudyLoading ? (
      <Box mx="auto" my={5} textAlign="center">
        <CircularProgress />
      </Box>
    ) : (
      <></>
    )
  }


  // const handleSearchParticipantRequest = async (
  //   searchValue: string | undefined
  // ) => {
  //   let searchOptions:
  //     | {searchParam: 'EXTERNAL_ID' | 'PHONE_NUMBER'; searchValue: string}
  //     | undefined = undefined
  //   if (searchValue) {
  //     setIsUserSearchingForParticipant(true)
  //     const isById = Utility.isSignInById(study.signInTypes)
  //     const searchParam = isById ? 'EXTERNAL_ID' : 'PHONE_NUMBER'
  //     searchOptions = {
  //       searchParam,
  //       searchValue,
  //     }
  //   } else {
  //     setIsUserSearchingForParticipant(false)
  //   }
  //   const searchResult = await run(
  //     ParticipantUtility.getParticipants(
  //       study.identifier,
  //       0,
  //       pageSize,
  //       tab,
  //       token!,
  //       searchOptions
  //     )
  //   )
  //   const {items, total} = searchResult || {items: [], total: 0}
  //   setParticipantData({items, total})
  // }

  const downloadParticipants = async (selectionType: SelectionType) => {
    setLoadingIndicators({isDownloading: true})
    try {
      //if getting all participants
      const participantsData: ParticipantData | undefined =
        selectionType === 'ALL'
          ? undefined
          : {
              items:
                data?.items?.filter(p =>
                  selectedParticipantIds[tab].includes(p.id)
                ) || [],
              total: selectedParticipantIds[tab].length,
            }
      const participantBlob = await CsvUtility.getParticipantDataForDownload(
        study.identifier,
        token!,
        tab,
        scheduleEvents.map(e => e.eventId),
        selectionType,
        Utility.isSignInById(study.signInTypes),
        participantsData
      )

      // get the fake link
      const fileObjUrl = URL.createObjectURL(participantBlob)
      setFileDownloadUrl(fileObjUrl)
    } catch (error) {
      alert(`Download error ${(error as Error).message.toString()}`)
    } finally {
      setLoadingIndicators({isDownloading: false})
    }
  }

  const displayPlaceholderScreen =
    !constants.constants.IS_TEST_MODE &&
    StudyService.getDisplayStatusForStudyPhase(study.phase) !== 'LIVE'

  const displayNoParticipantsPage =
    // status !== 'PENDING' && data?.items.length == 0 && tab === 'WITHDRAWN'
    curStatus !== 'PENDING' && data?.items.length == 0 && tab === 'WITHDRAWN'


  return (
    <Box bgcolor="#F8F8F8">
      <Box px={3} py={2} display="flex" alignItems="center">
        <div className={classes.studyId}>
          <NonDraftHeaderFunctionComponent study={study} />
        </div>
      </Box>

      {displayPlaceholderScreen && <ParticipantManagerPlaceholder />}
      {['COMPLETED', 'WITHDRAWN'].includes(
        StudyService.getDisplayStatusForStudyPhase(study.phase)
      ) && <UnderConstructionSC />}
      {!displayPlaceholderScreen && (
        <>
          <Box py={0} pr={3} pl={2}>
            <Tabs
              value={tab}
              variant="standard"
              onChange={handleTabChange}
              TabIndicatorProps={{hidden: true}}>
              <GoToDownloadPageLinkSC />
              {TAB_DEFs.map((tabDef, index) => (
                <Tab
                  key={`tab_${tabDef.label}`}
                  value={tabDef.type}
                  classes={{
                    root: clsx(
                      classes.tab,
                      tab === tabDef.type && classes.selectedTab,
                      tabDef.type === 'WITHDRAWN' &&
                        classes.withdrawnParticipants
                    ),
                  }}
                  icon={
                    <Box
                      display="flex"
                      flexDirection="row"
                      className={clsx(
                        classes.tab_icon,
                        tab !== tabDef.type && classes.unactiveTabIcon
                      )}>
                      <img
                        src={
                          tab === tabDef.type
                            ? TAB_ICONS_FOCUS[index]
                            : TAB_ICONS_UNFOCUS[index]
                        }
                        style={{marginRight: '6px'}}></img>
                      <div>
                        {`${tabDef.label} ${
                          tab === tabDef.type
                            ? data
                              ? `(${data.total})`
                              : '(...)'
                            : ''
                        }`}
                      </div>
                    </Box>
                  }
                />
              ))}
            </Tabs>
            <Box bgcolor="white">
              <CollapsibleLayout
                expandedWidth={300}
                isFullWidth={true}
                isHideContentOnClose={true}
                isDrawerHidden={tab === 'WITHDRAWN'}
                collapseButton={
                  <CollapseIcon
                    className={clsx(
                      tab === 'TEST' && classes.collapsedAddTestUser
                    )}
                  />
                }
                onToggleClick={(open: boolean) => setIsAddOpen(open)}
                expandButton={
                  tab === 'ACTIVE' ? (
                    <AddParticipantsIcon title="Add Participant" />
                  ) : (
                    <AddTestParticipantsIconSC title="Add Test Participant" />
                  )
                }
                toggleButtonStyle={{
                  display: 'block',
                  padding: '0',
                  borderRadius: 0,
                  backgroundColor:
                    tab === 'ACTIVE' ? theme.palette.primary.dark : '#AEDCC9',
                }}>
                <>
                  <AddParticipants
                    scheduleEvents={scheduleEvents}
                    study={study}
                    token={token!}
                    onAdded={() => {
                      setRefreshParticipantsToggle(prev => !prev)
                    }}
                    isTestAccount={tab === 'TEST'}
                  />
                </>
                {displayNoParticipantsPage ? (
                  <WithdrawnTabNoParticipantsPage />
                ) : (
                  <div>
                    <Box className={classes.gridToolBar}>
                      <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center">
                        {/* This is here for now because the "Send SMS link" feature is not being included in the october release. */}
                        {false && !Utility.isSignInById(study!.signInTypes) && (
                          <Button
                            aria-label="send-sms-text"
                            onClick={() => {
                              setParticipantsWithError([])
                              setDialogState({
                                dialogOpenRemove: false,
                                dialogOpenSMS: true,
                              })
                            }}
                            style={{marginRight: theme.spacing(1)}}
                            disabled={selectedParticipantIds[tab].length === 0}>
                            <img
                              src={SMSPhoneImg}
                              className={clsx(
                                selectedParticipantIds[tab].length === 0 &&
                                  classes.disabledImage,
                                classes.topRowImage
                              )}></img>
                            Send SMS link
                          </Button>
                        )}
                        {tab === 'ACTIVE' && (
                          <Button
                            aria-label="batch-edit"
                            onClick={() => {
                              setIsBatchEditOpen(true)
                            }}
                            style={{marginRight: theme.spacing(2)}}
                            disabled={selectedParticipantIds[tab].length <= 1}>
                            <img
                              className={clsx(
                                selectedParticipantIds[tab].length <= 1 &&
                                  classes.disabledImage,
                                classes.topRowImage
                              )}
                              src={BatchEditIcon}></img>
                            Batch Edit
                          </Button>
                        )}

                        <ParticipantDownloadTrigger
                          onDownload={() =>
                            downloadParticipants(isAllSelected ? 'ALL' : 'SOME')
                          }
                          fileDownloadUrl={fileDownloadUrl}
                          hasItems={
                            !!data?.items?.length &&
                            selectedParticipantIds[tab].length > 0
                          }
                          onDone={() => {
                            URL.revokeObjectURL(fileDownloadUrl!)
                            setFileDownloadUrl(undefined)
                          }}>
                          <>
                            <img
                              src={DownloadIcon}
                              style={{
                                marginRight: '6px',
                                opacity:
                                  selectedParticipantIds[tab].length === 0
                                    ? 0.5
                                    : 1,
                              }}></img>
                            {!loadingIndicators.isDownloading ? (
                              'StudyParticipants.csv'
                            ) : (
                              <CircularProgress size={24} />
                            )}
                          </>
                        </ParticipantDownloadTrigger>

                        <Button
                          aria-label="delete"
                          onClick={() => {
                            setParticipantsWithError([])
                            setDialogState({
                              dialogOpenRemove: true,
                              dialogOpenSMS: false,
                            })
                          }}
                          style={{marginLeft: theme.spacing(3)}}
                          disabled={selectedParticipantIds[tab].length === 0}>
                          <DeleteIcon
                            className={clsx(
                              selectedParticipantIds[tab].length === 0 &&
                                classes.disabledImage,
                              classes.topRowImage,
                              classes.deleteIcon
                            )}></DeleteIcon>
                          Remove from Study
                        </Button>
                      </Box>
                      <ParticipantSearch
                        isSearchById={Utility.isSignInById(study.signInTypes)}
                        onReset={() => {
                          // handleSearchParticipantRequest(undefined)
                          return
                        }}
                        onSearch={(searchedValue: string) => {
                          // handleSearchParticipantRequest(searchedValue)
                          return
                        }}
                        tab={tab}
                      />
                    </Box>
                    <div
                      role="tabpanel"
                      hidden={false}
                      id={`active-participants`}
                      className={classes.tabPanel}
                      style={{
                        marginLeft:
                          !isAddOpen && tab !== 'WITHDRAWN' ? '-48px' : '0',
                      }}>
                      <ParticipantTableGrid
                        rows={data?.items || []}
                        // status={status}
                        status={curStatus}
                        scheduleEventIds={
                          scheduleEvents.map(e => e.eventId) || []
                        }
                        studyId={study.identifier}
                        totalParticipants={data?.total || 0}
                        isAllSelected={isAllSelected}
                        gridType={tab}
                        selectedParticipantIds={selectedParticipantIds[tab]}
                        onWithdrawParticipant={(
                          participantId: string,
                          note: string
                        ) => onAction(study.identifier, 'WITHDRAW',currentPage,pageSize,tab, participantId, note)}
                        onUpdateParticipant={(
                          participantId: string,
                          note: string,
                          customEvents?: ParticipantEvent[],
                          clientTimeZone?: string
                        ) => {
                          const data = {
                            note: note,
                            clientTimeZone: clientTimeZone,
                          } //timezone empty  || '-'
                          if ((clientTimeZone?.length || 0) < 2) {
                            delete data.clientTimeZone
                          }
                          onAction(
                            study.identifier,
                            'UPDATE',
                            currentPage,
                            pageSize,
                            tab,
                            participantId,
                            undefined,
                            data,
                            customEvents || []
                          )
                        }}
                        isEnrolledById={Utility.isSignInById(study.signInTypes)}
                        onRowSelected={(
                          /*id: string, isSelected: boolean*/ selection,
                          isAll
                        ) => {
                          if (isAll !== undefined) {
                            setIsAllSelected(isAll)
                          }
                          setSelectedParticipantIds(prev => ({
                            ...prev,
                            [tab]: selection,
                          }))
                        }}>
                        <TablePagination
                          totalItems={data?.total || 0}
                          onPageSelectedChanged={(pageSelected: number) => {
                            setCurrentPage(pageSelected)
                          }}
                          currentPage={currentPage}
                          pageSize={pageSize}
                          setPageSize={setPageSize}
                          counterTextSingular="participant"
                        />
                      </ParticipantTableGrid>
                    </div>
                  </div>
                )}
                <Box textAlign="center" pl={2}>
                  {tab !== 'TEST' ? 'ADD A PARTICIPANT' : 'ADD TEST USER'}
                </Box>
              </CollapsibleLayout>
            </Box>
          </Box>
          <BatchEditForm
            isEnrolledById={Utility.isSignInById(study.signInTypes)}
            isBatchEditOpen={isBatchEditOpen}
            onSetIsBatchEditOpen={setIsBatchEditOpen}
            selectedParticipants={selectedParticipantIds[tab]}
            token={token!}
            studyId={study.identifier}
            onToggleParticipantRefresh={() =>
              setRefreshParticipantsToggle(prev => !prev)
            }
            isAllSelected={isAllSelected}></BatchEditForm>
          <Dialog
            open={dialogState.dialogOpenSMS || dialogState.dialogOpenRemove}
            maxWidth="xs"
            scroll="body"
            aria-labelledby="Remove Participant">
            <DialogTitleWithClose
              onCancel={() => {
                setDialogState({
                  dialogOpenRemove: false,
                  dialogOpenSMS: false,
                })
              }}
              icon={
                dialogState.dialogOpenRemove ? (
                  <DeleteIcon />
                ) : (
                  <PinkSendSMSIcon />
                )
              }
              title={
                dialogState.dialogOpenRemove
                  ? 'Remove From Study'
                  : 'Sending SMS Download Link'
              }
            />
            <DialogContent style={{display: 'flex', justifyContent: 'center'}}>
              {(dialogState.dialogOpenRemove || dialogState.dialogOpenSMS) && (
                <DialogContents
                  participantsWithError={participantsWithError}
                  study={study}
                  selectedParticipants={
                    data?.items?.filter(participant =>
                      selectedParticipantIds[tab].includes(participant.id)
                    ) || []
                  }
                  isProcessing={!!loadingIndicators.isDeleting}
                  isRemove={dialogState.dialogOpenRemove}
                  selectingAll={isAllSelected}
                  tab={tab}
                  token={token!}
                />
              )}
            </DialogContent>

            {participantsWithError.length === 0 && (
              <DialogActions>
                <DialogButtonSecondary
                  onClick={() =>
                    setDialogState({
                      dialogOpenRemove: false,
                      dialogOpenSMS: false,
                    })
                  }
                  style={{height: '48px'}}>
                  Cancel
                </DialogButtonSecondary>

                <DialogButtonPrimary
                  onClick={() => onAction(study.identifier, 'DELETE', currentPage, pageSize, tab)}
                  autoFocus
                  className={classes.primaryDialogButton}>
                  {dialogState.dialogOpenRemove
                    ? 'Permanently Remove'
                    : 'Yes, send SMS'}
                </DialogButtonPrimary>
              </DialogActions>
            )}

            {participantsWithError.length > 0 && (
              <DialogActions>
                <DialogButtonPrimary
                  onClick={() => {
                    setRefreshParticipantsToggle(prev => !prev)
                    setDialogState({
                      dialogOpenRemove: false,
                      dialogOpenSMS: false,
                    })
                  }}
                  color="primary">
                  Done
                </DialogButtonPrimary>
              </DialogActions>
            )}
          </Dialog>
        </>
      )}
    </Box>
  )
}
export default ParticipantManager
