import { Box, Paper, Switch, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import _ from 'lodash'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useErrorHandler } from 'react-error-boundary'
import PhoneBg from '../../../assets/appdesign/phone_bg.svg'
import { ReactComponent as PhoneBottomImg } from '../../../assets/appdesign/phone_buttons.svg'
import { ReactComponent as PhoneTopImgLeftHighlighted } from '../../../assets/appdesign/CustomizeAppTopbarLeft.svg'
import { ReactComponent as PhoneTopImgRightHighlighted } from '../../../assets/appdesign/CustomizeAppTopbarRight.svg'
import { latoFont, ThemeType, playfairDisplayFont } from '../../../style/theme'
import {
  StudyBuilderComponentProps,
  Contact,
  WelcomeScreenData,
  StudyAppDesign,
  Study,
} from '../../../types/types'
import { MTBHeadingH1, MTBHeadingH2 } from '../../widgets/Headings'
import DefaultLogo from '../../../assets/logo_mtb.svg'
import clsx from 'clsx'
import { useUserSessionDataState } from '../../../helpers/AuthContext'
import SectionIndicator from './SectionIndicator'
import StudyPagePhoneContent from './StudyPagePhoneContent'
import WelcomeScreenPhoneContent from './WelcomeScreenPhoneContent'
import UploadStudyLogoSection from './UploadStudyLogoSection'
import ColorPickerSection from './ColorPickerSection'
import WelcomeScreenMessagingSection from './WelcomeScreenMessagingSection'
import StudySummarySection from './StudySummarySection'
import StudyLeadInformationSection from './StudyLeadInformationSection'
import GeneralContactAndSupportSection from './GeneralContactAndSupportSection'
import IrbBoardContactSection from './IrbBoardContactSection'
import StudySummaryRoles from './StudySummaryRoles'
import ContactInformation from './ContactInformation'
import StudyPageBottomPhoneContent from './StudyPageBottomPhoneContent'

const imgHeight = 70

const useStyles = makeStyles((theme: ThemeType) => ({
  root: { counterReset: 'orderedlist' },
  section: {
    padding: theme.spacing(9, 9, 10, 17),
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(9),
      paddingRight: theme.spacing(2),
    },
  },
  steps: {
    listStyleType: 'none',
    margin: theme.spacing(5, 0, 0, 0),
    padding: 0,
    '& li': {
      display: 'flex',
      marginBottom: theme.spacing(6),
      textAlign: 'left',
    },
    '& li::before': {
      counterIncrement: 'orderedlist',
      content: 'counter(orderedlist)',
      flexShrink: 0,

      textAlign: 'center',
      color: '#fff',
      backgroundColor: '#000',
      borderRadius: '50%',
      width: theme.spacing(5),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing(3),
      marginLeft: theme.spacing(-8),
      height: theme.spacing(5),
    },
  },
  phoneArea: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(3),
    width: theme.spacing(41),
  },
  phone: {
    display: 'flex',
    flexDirection: 'column',
    backgroundImage: 'url(' + PhoneBg + ')',
    width: '100%',
    marginTop: theme.spacing(4),
    backgroundRepeat: 'no-repeat',
    justifyContent: 'space-between',
    wordWrap: 'break-word',
  },
  phoneBottom: {
    height: '70px',
    overflow: 'hidden',
    marginBottom: theme.spacing(-3),
    width: '320px',
    marginLeft: '5px',
    border: '4px solid black',
    borderTop: '0px none transparent',
    borderRadius: '0 0px 24px 24px',
  },
  phoneTopBar: {
    width: '320px',
    marginLeft: '5px',
    height: `${imgHeight + 16}px`,
    borderRadius: '25px 25px 0 0',
    borderStyle: 'solid',
    borderWidth: '4px 4px 0px 4px',
    borderColor: 'black',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    backgroundColor: '#EBEBEB',
    padding: '0 .8rem',
    fontSize: '1.6rem',
    //margin: '0 -50px 30px -50px',
    '& > div': {
      padding: '15px 13px',
    },
    '& img': {
      width: '100%',
    },
  },
  fields: {
    display: 'flex',
    textAlign: 'left',
    flexGrow: 1,
    flexDirection: 'column',
    maxWidth: theme.spacing(51),
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '100%',
    },
  },
  smallScreenText: {
    fontSize: '15px',
    marginTop: theme.spacing(3.75),
    whiteSpace: 'pre-wrap',
  },
  switchContainer: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: '16px',
    lineHeight: '19px',
    fontFamily: 'Lato',
    alignItems: 'center',
    fontWeight: 'bold',
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(4),
  },
  hideSection: {
    display: 'none',
  },
  hideSectionVisibility: {
    visibility: 'hidden',
  },
  sectionOneIndicatorPosition: {
    position: 'absolute',
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(-1.5),
  },
  sectionTwoIndicatorPosition: {
    position: 'absolute',
    marginTop: theme.spacing(6),
    marginLeft: theme.spacing(-1.5),
  },
  optionalDisclaimerTextOnPhone: {
    fontSize: '12px',
    fontStyle: 'italic',
    paddingLeft: theme.spacing(4),
    textAlign: 'left',
  },
  //here
  sectionFourIndicatorPosition: {
    marginTop: theme.spacing(-0.5),
    position: 'absolute',
    marginLeft: theme.spacing(-6.5),
  },
  headlineStyle: {
    fontFamily: playfairDisplayFont,
    fontStyle: 'italic',
    fontWeight: 'normal',
    fontSize: '21px',
    lineHeight: '28px',
    whiteSpace: 'pre-line',
  },
  phoneInnerBottom: {
    marginLeft: '5px',
    marginRight: theme.spacing(0.26),
    padding: theme.spacing(4),
    textAlign: 'left',
    minHeight: `500px`,
    borderRight: '4px solid black',
    borderLeft: '4px solid black',
  },
  bodyText: {
    fontFamily: latoFont,
    fontWeight: 'normal',
    fontSize: '15px',
    lineHeight: '18px',
    marginTop: theme.spacing(3),
    whiteSpace: 'pre-line',
  },
  bodyPhoneText: {
    fontFamily: latoFont,
    fontWeight: 'normal',
    fontSize: '12px',
    lineHeight: '15px',
    marginTop: theme.spacing(1),
    textAlign: 'left',
  },
  divider: {
    width: '256px',
    marginTop: theme.spacing(3.75),
  },
  sectionFiveIndicatorPosition: {
    marginTop: theme.spacing(2.5),
    position: 'absolute',
    marginLeft: theme.spacing(-6.5),
  },
  phoneGrayBackground: {
    backgroundColor: '#F7F7F7',
  },
  contactAndSupportText: {
    fontFamily: 'Poppins',
    fontWeight: 'normal',
    fontSize: '18px',
    lineHeight: '24px',
    textAlign: 'left',
  },
  summaryRoles: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1.25),
    marginTop: theme.spacing(1),
  },
  sectionSixAndSevenIndicatorPosition: {
    marginTop: theme.spacing(2.5),
    position: 'absolute',
    marginLeft: theme.spacing(-39.5),
  },
  studyPageTopBar: {
    backgroundColor: '#F6F6F6',
  },
}))

type UploadedFile = {
  success: boolean
  fileName: string
  message: string
}

export type PreviewFile = {
  file: File
  name: string
  size: number
  body?: string
}

export enum AppDesignUpdateTypes {
  UPDATE_STUDY_NAME = 'UPDATE_STUDY_NAME',
  UPDATE_STUDY_COLOR = 'UPDATE_STUDY_COLOR',
  UPDATE_STUDY_CONTACTS = 'UPDATE_STUDY_CONTACTS',
  UPDATE_STUDY_DESCRIPTION = 'UPDATE_STUDY_DESCRIPTION',
  UPDATE_STUDY_IRB_NUMBER = 'UPDATE_STUDY_IRB_NUMBER',
  UPDATE_STUDY_LOGO = 'UPDATE_STUDY_LOGO',
  UPDATE_WELCOME_SCREEN_INFO = 'UPDATE_WELCOME_SCREEN_INFO',
}

export type PossibleStudyUpdates =
  | AppDesignUpdateTypes.UPDATE_STUDY_NAME
  | AppDesignUpdateTypes.UPDATE_STUDY_COLOR
  | AppDesignUpdateTypes.UPDATE_STUDY_CONTACTS
  | AppDesignUpdateTypes.UPDATE_STUDY_LOGO
  | AppDesignUpdateTypes.UPDATE_STUDY_IRB_NUMBER
  | AppDesignUpdateTypes.UPDATE_WELCOME_SCREEN_INFO
  | AppDesignUpdateTypes.UPDATE_STUDY_DESCRIPTION

export interface AppDesignProps {
  id: string
  onSave: Function
  study: Study
  sideDrawerIsOpen: boolean
}

function getPreviewForImage(file: File): PreviewFile {
  const previewFileBody = URL.createObjectURL(file)
  return {
    file: file,
    body: previewFileBody,
    name: file.name,
    size: file.size,
  }
}

const PhoneTopBar: React.FunctionComponent<{
  color?: string
  previewFile?: PreviewFile
  isUsingDefaultMessage?: boolean
  studyPagePhoneIndex?: number
}> = ({ color = 'transparent', previewFile, isUsingDefaultMessage }) => {
  const classes = useStyles()
  return (
    <div
      className={classes.phoneTopBar}
      style={{ backgroundColor: isUsingDefaultMessage ? '#BCD5E4' : color }}
    >
      {!isUsingDefaultMessage ? (
        previewFile && (
          <img
            src={previewFile.body}
            style={{ height: `${imgHeight}px` }}
            alt="study-logo"
          />
        )
      ) : (
        <img
          src={DefaultLogo}
          style={{ height: `${imgHeight - 16}px` }}
          alt="study-logo"
        />
      )}
    </div>
  )
}

const AppDesign: React.FunctionComponent<
  AppDesignProps & StudyBuilderComponentProps
> = ({
  id,
  hasObjectChanged,
  saveLoader,
  children,
  onUpdate,
  onSave,
  study,
  sideDrawerIsOpen,
}: AppDesignProps & StudyBuilderComponentProps) => {
  const handleError = useErrorHandler()

  const { token, orgMembership } = useUserSessionDataState()

  const classes = useStyles()

  const [previewFile, setPreviewFile] = useState<PreviewFile>()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [
    irbNameSameAsInstitution,
    setIrbNameSameAsInstitution,
  ] = useState<boolean>(true)

  const SimpleTextInputStyles = {
    fontSize: '15px',
    width: '100%',
    height: '44px',
    paddingTop: '13px',
    boxSizing: 'border-box',
  } as React.CSSProperties

  const [
    appDesignProperties,
    setAppDesignProperties,
  ] = useState<StudyAppDesign>({
    logo: '',
    backgroundColor: {
      foreground: '#6040FF',
    },
    welcomeScreenInfo: {
      welcomeScreenBody: '',
      welcomeScreenFromText: '',
      welcomeScreenSalutation: '',
      welcomeScreenHeader: '',
      isUsingDefaultMessage: false,
      useOptionalDisclaimer: false,
    } as WelcomeScreenData,
    studyTitle: '',
    studySummaryBody: '',
    irbProtocolId: '',
    leadPrincipleInvestigatorInfo: undefined,
    contactLeadInfo: undefined,
    ethicsBoardInfo: undefined,
    funder: undefined,
  })

  const [
    generalContactPhoneNumber,
    setGeneralContactPhoneNumber,
  ] = React.useState('')
  const [irbPhoneNumber, setIrbPhoneNumber] = React.useState('')

  const [phoneNumberErrorState, setPhoneNumberErrorState] = React.useState({
    isGeneralContactPhoneNumberValid: true,
    isIrbPhoneNumberValid: true,
  })

  const [emailErrorState, setEmailErrorState] = React.useState({
    isGeneralContactEmailValid: true,
    isIrbEmailValid: true,
  })

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    event.persist()
    if (!event.target.files) {
      return
    }
    const file = event.target.files[0]
    const previewForImage = getPreviewForImage(file)
    setPreviewFile(previewForImage)
  }

  const saveInfo = () => {
    const phoneNumberHasError =
      !phoneNumberErrorState.isGeneralContactPhoneNumberValid ||
      !phoneNumberErrorState.isIrbPhoneNumberValid
    const emailHasError =
      !emailErrorState.isGeneralContactEmailValid ||
      !emailErrorState.isIrbEmailValid
    // This is a placeholder until Lynn finalizes what the error state will look like
    if (phoneNumberHasError || emailHasError) {
      alert(
        'Please make sure that all fields are entered in the correct format.',
      )
      return
    }
    const updatedStudy = { ...study }
    const irbContact = updatedStudy.contacts?.find(el => el.role === 'irb')
    // If a contact's email or phone is an empty string, then delete the field
    // from the contact object.
    if (irbContact?.email === '') {
      delete irbContact.email
    }
    const irbPhoneNumber = irbContact?.phone?.number
    if (irbPhoneNumber === '' || irbPhoneNumber === '+1') {
      delete irbContact!.phone
    }
    const generalContact = updatedStudy.contacts?.find(
      el => el.role === 'study_support',
    )
    if (generalContact?.email === '') {
      delete generalContact.email
    }
    const generalContactPhone = generalContact?.phone?.number
    if (generalContactPhone === '' || generalContactPhone === '+1') {
      delete generalContact!.phone
    }
    onSave(updatedStudy)
  }

  const updateAppDesignInfo = (
    updateType: PossibleStudyUpdates,
    color?: string,
  ) => {
    const appDesignProps = { ...appDesignProperties }
    if (color) {
      appDesignProps.backgroundColor.foreground = color
    }
    const updatedStudy = { ...study }
    // update the study based on the update type specified
    switch (updateType) {
      case AppDesignUpdateTypes.UPDATE_STUDY_NAME:
        updatedStudy.name = appDesignProps.studyTitle
        break
      case AppDesignUpdateTypes.UPDATE_STUDY_COLOR:
        updatedStudy.colorScheme!.foreground =
          appDesignProps.backgroundColor.foreground
        break
      case AppDesignUpdateTypes.UPDATE_STUDY_CONTACTS:
        const contacts: Contact[] = []
        if (appDesignProps.ethicsBoardInfo) {
          contacts.push(appDesignProps.ethicsBoardInfo)
        }
        if (appDesignProps.funder) {
          contacts.push(appDesignProps.funder)
        }
        if (appDesignProps.contactLeadInfo) {
          contacts.push(appDesignProps.contactLeadInfo)
        }
        if (appDesignProps.leadPrincipleInvestigatorInfo) {
          contacts.push(appDesignProps.leadPrincipleInvestigatorInfo)
        }
        updatedStudy.contacts = contacts
        break
      case AppDesignUpdateTypes.UPDATE_STUDY_DESCRIPTION:
        updatedStudy.details = appDesignProps.studySummaryBody
        break
      case AppDesignUpdateTypes.UPDATE_STUDY_IRB_NUMBER:
        updatedStudy.irbProtocolId = appDesignProps.irbProtocolId
        break
      case AppDesignUpdateTypes.UPDATE_STUDY_LOGO:
        updatedStudy.studyLogoUrl = appDesignProps.logo
        break
      case AppDesignUpdateTypes.UPDATE_WELCOME_SCREEN_INFO:
        updatedStudy.clientData.welcomeScreenData = {
          ...appDesignProps.welcomeScreenInfo,
        }
        break
    }
    onUpdate(updatedStudy)
  }

  const debouncedUpdateColor = useCallback(
    _.debounce(
      color =>
        updateAppDesignInfo(AppDesignUpdateTypes.UPDATE_STUDY_COLOR, color),
      1000,
    ),
    [],
  )

  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.length != 10) {
      return phoneNumber
    }
    return (
      phoneNumber.slice(0, 3) +
      '-' +
      phoneNumber.slice(3, 6) +
      '-' +
      phoneNumber.slice(6)
    )
  }

  useEffect(() => {
    // When the component mounts, pull out the information from the study object
    const contacts = study.contacts || []
    const leadPrincipleInvestigatorContact = contacts.find(
      el => el.role === 'principal_investigator',
    )
    const funder = contacts.find(el => el.role === 'sponsor')
    const irbInfo = contacts.find(el => el.role === 'irb')
    const studySupport = contacts.find(el => el.role === 'study_support')
    if (studySupport?.phone) {
      const phoneWithoutZipcode = studySupport.phone.number?.replace('+1', '')
      const formattedPhone = formatPhoneNumber(phoneWithoutZipcode)
      setGeneralContactPhoneNumber(formattedPhone)
    }
    if (irbInfo?.phone) {
      const phoneWithoutZipcode = irbInfo.phone.number?.replace('+1', '')
      const formattedPhone = formatPhoneNumber(phoneWithoutZipcode)
      setIrbPhoneNumber(formattedPhone)
    }
    const isWelcomeScreenDataEmpty =
      Object.keys(study.clientData.welcomeScreenData || {}).length == 0
    const welcomeScreenData = isWelcomeScreenDataEmpty
      ? { ...appDesignProperties.welcomeScreenInfo }
      : { ...study.clientData.welcomeScreenData! }
    setIrbNameSameAsInstitution(
      irbInfo?.name === leadPrincipleInvestigatorContact?.affiliation,
    )
    setAppDesignProperties(prevState => {
      return {
        ...prevState,
        leadPrincipleInvestigatorInfo: leadPrincipleInvestigatorContact,
        funder: funder,
        ethicsBoardInfo: irbInfo,
        contactLeadInfo: studySupport,
        logo: study.studyLogoUrl || '',
        backgroundColor: study.colorScheme || {
          ...appDesignProperties.backgroundColor,
        },
        welcomeScreenInfo: welcomeScreenData,
        studyTitle: study.name || '',
        studySummaryBody: study.details || '',
        irbProtocolId: study.irbProtocolId || '',
      }
    })
  }, [])

  useEffect(() => {
    updateAppDesignInfo(AppDesignUpdateTypes.UPDATE_WELCOME_SCREEN_INFO)
  }, [
    appDesignProperties.welcomeScreenInfo.useOptionalDisclaimer,
    appDesignProperties.welcomeScreenInfo.isUsingDefaultMessage,
  ])

  useEffect(() => {
    updateAppDesignInfo(AppDesignUpdateTypes.UPDATE_STUDY_CONTACTS)
  }, [
    appDesignProperties.leadPrincipleInvestigatorInfo?.name,
    appDesignProperties.contactLeadInfo?.phone,
    appDesignProperties.ethicsBoardInfo?.phone,
    appDesignProperties.ethicsBoardInfo?.name,
  ])

  const getContact = (
    type: 'FUNDER' | 'ETHICS_BOARD' | 'LEAD_INVESTIGATOR' | 'CONTACT',
  ) => {
    if (type === 'FUNDER') {
      return appDesignProperties.funder
        ? { ...appDesignProperties.funder }
        : ({ role: 'sponsor', name: '' } as Contact)
    } else if (type === 'ETHICS_BOARD') {
      return appDesignProperties.ethicsBoardInfo
        ? { ...appDesignProperties.ethicsBoardInfo }
        : ({ role: 'irb', name: '' } as Contact)
    } else if (type === 'LEAD_INVESTIGATOR') {
      return appDesignProperties.leadPrincipleInvestigatorInfo
        ? { ...appDesignProperties.leadPrincipleInvestigatorInfo }
        : ({ role: 'principal_investigator', name: '' } as Contact)
    } else {
      return appDesignProperties.contactLeadInfo
        ? { ...appDesignProperties.contactLeadInfo }
        : ({
            role: 'study_support',
            name: '',
          } as Contact)
    }
  }
  return (
    <Box className={classes.root}>
      <Paper className={classes.section} elevation={2} id="container">
        <Box className={classes.fields}>
          <MTBHeadingH2>WELCOME SCREEN</MTBHeadingH2>
          <p className={classes.smallScreenText}>
            When a participant downloads the app, they will be presented a
            welcome screen after signing into the study.
            <br></br>
            <br></br>
            You can choose a default message or customize this screen below by
            adding your logo, background color, and message. View how it would
            be displayed to the right.
          </p>
          <div className={classes.switchContainer}>
            <Box marginRight="12px">Use default message</Box>
            <Box marginTop="4px">
              <Switch
                color="primary"
                checked={
                  !appDesignProperties.welcomeScreenInfo.isUsingDefaultMessage
                }
                onChange={() =>
                  setAppDesignProperties(prevState => {
                    const newWelcomeScreenData = {
                      ...prevState.welcomeScreenInfo,
                    }
                    newWelcomeScreenData.isUsingDefaultMessage = !prevState
                      .welcomeScreenInfo.isUsingDefaultMessage
                    return {
                      ...appDesignProperties,
                      welcomeScreenInfo: newWelcomeScreenData,
                    }
                  })
                }
              ></Switch>
            </Box>
            <Box marginLeft="12px">Customize</Box>
          </div>
          <div
            className={clsx(
              appDesignProperties.welcomeScreenInfo.isUsingDefaultMessage &&
                classes.hideSection,
            )}
          >
            <ol className={classes.steps}>
              <UploadStudyLogoSection
                handleFileChange={handleFileChange}
                previewFile={previewFile}
                imgHeight={imgHeight}
                saveLoader={saveLoader}
              />
              <ColorPickerSection
                appDesignProperties={appDesignProperties}
                setAppDesignProperties={setAppDesignProperties}
                debouncedUpdateColor={debouncedUpdateColor}
              />
              <WelcomeScreenMessagingSection
                appDesignProperties={appDesignProperties}
                setAppDesignProperties={setAppDesignProperties}
                updateAppDesignInfo={updateAppDesignInfo}
                saveLoader={saveLoader}
                saveInfo={saveInfo}
                SimpleTextInputStyles={SimpleTextInputStyles}
              />
            </ol>
          </div>
          {appDesignProperties.welcomeScreenInfo.isUsingDefaultMessage && (
            <Box className={classes.hideSectionVisibility}>
              <ol className={classes.steps}>
                <li></li>
                <li></li>
                <li></li>
              </ol>
            </Box>
          )}
        </Box>
        <Box className={classes.phoneArea}>
          <MTBHeadingH1>What participants will see: </MTBHeadingH1>
          <Box className={classes.phone}>
            <SectionIndicator
              index={1}
              className={clsx(classes.sectionOneIndicatorPosition)}
            />
            <SectionIndicator
              index={2}
              className={clsx(classes.sectionTwoIndicatorPosition)}
            />
            <PhoneTopBar
              color={appDesignProperties.backgroundColor.foreground}
              previewFile={previewFile}
              isUsingDefaultMessage={
                appDesignProperties.welcomeScreenInfo.isUsingDefaultMessage
              }
            />
            <WelcomeScreenPhoneContent
              appDesignProperties={appDesignProperties}
            />
            <Box
              className={clsx(
                classes.phoneBottom,
                classes.optionalDisclaimerTextOnPhone,
              )}
            >
              {appDesignProperties.welcomeScreenInfo.useOptionalDisclaimer
                ? 'This is a research study and does not provide medical advice,diagnosis, or treatment'
                : ''}
            </Box>
          </Box>
        </Box>
      </Paper>
      <Paper className={classes.section} elevation={2}>
        <Box className={classes.fields}>
          <MTBHeadingH2>Study Page</MTBHeadingH2>
          <p className={classes.smallScreenText}>
            Within the app, there will be a dedicated page where you can
            describe your study further and list who to contact for participant
            support.
          </p>
          <ol className={classes.steps}>
            <StudySummarySection
              appDesignProperties={appDesignProperties}
              setAppDesignProperties={setAppDesignProperties}
              updateAppDesignInfo={updateAppDesignInfo}
              SimpleTextInputStyles={SimpleTextInputStyles}
            />
            <StudyLeadInformationSection
              appDesignProperties={appDesignProperties}
              setAppDesignProperties={setAppDesignProperties}
              updateAppDesignInfo={updateAppDesignInfo}
              SimpleTextInputStyles={SimpleTextInputStyles}
              orgMembership={orgMembership}
              token={token}
              getContact={getContact}
              irbNameSameAsInstitution={irbNameSameAsInstitution}
            />
            <GeneralContactAndSupportSection
              appDesignProperties={appDesignProperties}
              setAppDesignProperties={setAppDesignProperties}
              updateAppDesignInfo={updateAppDesignInfo}
              SimpleTextInputStyles={SimpleTextInputStyles}
              phoneNumberErrorState={phoneNumberErrorState}
              setPhoneNumberErrorState={setPhoneNumberErrorState}
              emailErrorState={emailErrorState}
              setEmailErrorState={setEmailErrorState}
              getContact={getContact}
              generalContactPhoneNumber={generalContactPhoneNumber}
              setGeneralContactPhoneNumber={setGeneralContactPhoneNumber}
            />
            <IrbBoardContactSection
              appDesignProperties={appDesignProperties}
              setAppDesignProperties={setAppDesignProperties}
              updateAppDesignInfo={updateAppDesignInfo}
              SimpleTextInputStyles={SimpleTextInputStyles}
              phoneNumberErrorState={phoneNumberErrorState}
              setPhoneNumberErrorState={setPhoneNumberErrorState}
              emailErrorState={emailErrorState}
              setEmailErrorState={setEmailErrorState}
              getContact={getContact}
              irbPhoneNumber={irbPhoneNumber}
              setIrbPhoneNumber={setIrbPhoneNumber}
              saveInfo={saveInfo}
              saveLoader={saveLoader}
              irbNameSameAsInstitution={irbNameSameAsInstitution}
              setIrbNameSameAsInstitution={setIrbNameSameAsInstitution}
            />
          </ol>
        </Box>

        <Box className={classes.phoneArea}>
          <MTBHeadingH1>What participants will see: </MTBHeadingH1>
          <Box className={classes.phone}>
            <Box className={clsx(classes.phoneTopBar, classes.studyPageTopBar)}>
              <PhoneTopImgLeftHighlighted
                title="phone top image"
                width="312px"
              />
            </Box>
            <Box className={classes.phoneBottom}>
              <PhoneBottomImg title="phone bottom image" />
            </Box>
          </Box>
          <Box className={classes.phone} marginTop="134px">
            <Box className={clsx(classes.phoneTopBar, classes.studyPageTopBar)}>
              <PhoneTopImgRightHighlighted
                title="phone top image"
                width="312px"
              />
            </Box>
            <StudyPageBottomPhoneContent
              appDesignProperties={appDesignProperties}
              generalContactPhoneNumber={generalContactPhoneNumber}
              irbPhoneNumber={irbPhoneNumber}
              studyID={id}
            />
            <div className={classes.phoneBottom}>
              <PhoneBottomImg title="phone bottom image" />
            </div>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default AppDesign
