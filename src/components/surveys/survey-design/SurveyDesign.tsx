import {ReactComponent as SaveIcon} from '@assets/surveys/actions/save.svg'
import Loader from '@components/widgets/Loader'
import UtilityObject from '@helpers/utility'
import {Alert, Box, styled} from '@mui/material'
import {
  useSurveyAssessment,
  useSurveyConfig,
  useUpdateSurveyAssessment,
  useUpdateSurveyConfig,
  useUpdateSurveyResource,
} from '@services/assessmentHooks'
import {theme} from '@style/theme'
import {Step, Survey} from '@typedefs/surveys'
import {Assessment} from '@typedefs/types'
import React, {FunctionComponent} from 'react'
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom'
import {ActionButton} from '../widgets/SharedStyled'
import IntroInfo from './IntroInfo'
import AddQuestionMenu from './left-panel/AddQuestionMenu'
import LeftPanel from './left-panel/LeftPanel'
import QUESTIONS, {QuestionTypeKey} from './left-panel/QuestionConfigs'
import QuestionEdit from './question-edit/QuestionEdit'
import QuestionEditRhs from './QuestionEditRhs'
import SurveyTitle from './SurveyTitle'

const SurveyDesignContainerBox = styled(Box)(({theme}) => ({
  position: 'relative',
  backgroundColor: 'pink',
  display: 'flex',

  minHeight: 'calc(100vh - 70px)',
}))

const AddQuestion = styled('div')(({theme}) => ({
  borderTop: '1px solid #f2f2f2',
  display: 'flex',
}))

type SurveyDesignOwnProps = {}

type SurveyDesignProps = SurveyDesignOwnProps & RouteComponentProps

const SurveyDesign: FunctionComponent<SurveyDesignProps> = () => {
  let {id: guid} = useParams<{
    id: string
  }>()

  const getIndex = (a: string | null) => {
    if (!a) {
      return undefined
    } else {
      return parseInt(a)
    }
  }

  const isNewSurvey = () => guid === ':id'

  const history = useHistory()
  const location = useLocation()
  const [assessment, setAssessment] = React.useState<Assessment | undefined>()
  const [survey, setSurvey] = React.useState<Survey | undefined>()
  const [error, setError] = React.useState('')
  const [currentStepIndex, setCurrentStepIndex] = React.useState<
    number | undefined
  >(getIndex(new URLSearchParams(location.search)?.get('q')))

  console.log(
    'reloading' +
      new URLSearchParams(location.search)?.get('q') +
      currentStepIndex
  )
  React.useEffect(() => {
    console.log('location change')
    const result = new URLSearchParams(location.search)?.get('q')
    setCurrentStepIndex(getIndex(result))
  }, [location])

  //rq get and modify data hooks
  const {data: _assessment, status: aStatus} = useSurveyAssessment(
    isNewSurvey() ? undefined : guid
  )
  const {data: _survey, status: cStatus} = useSurveyConfig(
    isNewSurvey() ? undefined : guid
  )

  const {
    isSuccess: asmntUpdateSuccess,
    isError: asmntUpdateError,
    mutateAsync: mutateAssessment,
  } = useUpdateSurveyAssessment()

  const {
    isSuccess: surveyUpdateSuccess,
    isError: surveyUpdateError,
    mutateAsync: mutateSurvey,
  } = useUpdateSurveyConfig()

  const {
    isSuccess: resourceUpdateSuccess,
    isError: resourceUpdateError,
    mutateAsync: mutateResource,
  } = useUpdateSurveyResource()

  //effects to populate local copies

  React.useEffect(() => {
    if (_assessment) {
      setAssessment(_assessment)
    }
  }, [_assessment])

  React.useEffect(() => {
    if (_survey) {
      setSurvey(_survey)
    }
  }, [_survey])

  /*React.useEffect(() => {
    let qIndex = new URLSearchParams(useLocation().search)?.get('q')

    setCurrentStepIndex(qIndex ? parseInt(qIndex) : undefined)
    console.log('changing index')
  }, [])
*/
  // fns used  to subcomponent callbackss
  const saveIconResource = async () => {
    if (assessment) {
      const r = assessment.resources?.find(r => r.category === 'icon')
      if (!r) {
        throw new Error('no resource')
      }
      return mutateResource({assessment, resource: r})
    }
  }

  const saveAssessment = async (
    asmnt: Assessment,
    survey: Survey,
    action: 'UPDATE' | 'CREATE'
  ) => {
    setError('')
    try {
      const result = await mutateAssessment({assessment: asmnt, action})
      await mutateSurvey({guid: result.guid!, survey})

      console.log('success')
      console.log(result)
      history.push(`/surveys/${result.guid}/design/title`)
      console.log('reloading')
    } catch (error) {
      setError((error as any).toString())
    }
  }

  const getQuestionList = (): Step[] => {
    //@ts-ignore
    return survey?.config.steps
      .filter(s => !!s)
      .map(s => ({
        identifier: s.identifier,
        title: s.title,
        type: s.type,
      }))
  }

  const updateSteps = (steps: Step[]) => {
    console.log('updating steps', steps)
    setSurvey(prev => ({
      ...prev!,
      config: {
        ...prev!.config,
        steps,
      },
    }))
  }

  const addStep = (title: QuestionTypeKey) => {
    if (!survey) {
      return
    }
    /*const newStep: Step = {
      identifier: Utility.generateNonambiguousCode(6, 'ALPHANUMERIC'),
      title,
      type: 'unkonwn',
    }*/
    console.log('adding')
    const id = UtilityObject.generateNonambiguousCode(6, 'CONSONANTS')
    const q = QUESTIONS.get(title)
    if (q && q.default) {
      const newStep: Step = {...q.default} as Step
      newStep.identifier = `${newStep.identifier}_${id}`
      console.log('adding step', newStep.identifier)
      const steps = [...survey.config.steps, newStep]
      updateSteps(steps)

      const currentStepId = survey?.config.steps.length
      console.log('wantto set current step')
      // setCurrentStepIndex(currentStepId)
      history.push(`/surveys/${guid}/design/question?q=${currentStepId}`)
    }
  }

  const updateCurrentStep = (step: Step) => {
    if (!survey) {
      return
    }
    if (currentStepIndex) {
      let steps = [...survey!.config.steps]
      steps[currentStepIndex] = step
      // setSurvey(prev => ({...prev!, steps}))
    }
  }

  const getCurrentStep = () =>
    currentStepIndex !== undefined
      ? survey?.config.steps[currentStepIndex]
      : undefined

  const isTitleScreen = () => {
    return location.pathname.includes('design/title')
  }

  return (
    <Loader reqStatusLoading={!isNewSurvey() && !survey}>
      <SurveyDesignContainerBox>
        {/* LEFT PANEL*/}y
        <LeftPanel
          surveyId={assessment?.identifier}
          currentStepIndex={currentStepIndex}
          titleImage={
            assessment?.resources?.find(r => r.category === 'icon')?.url
          }
          guid={guid}
          surveyConfig={survey?.config}
          onUpdateSteps={(steps: Step[]) => updateSteps(steps)}>
          <AddQuestion>
            <AddQuestionMenu onSelectQuestion={qType => addStep(qType)} />
          </AddQuestion>
        </LeftPanel>
        {/* CEDNTRAL PHONE AREA*/}
        <Box display="flex" flexGrow={1} justifyContent="space-between">
          {error && <Alert color="error">{error}</Alert>}
          <Switch>
            <Route path={`/surveys/:id/design/title`}>
              {assessment && survey && (
                <SurveyTitle
                  onSave={() => {
                    saveIconResource()
                    mutateSurvey({guid: assessment.guid!, survey})
                  }}
                  onUpdateResource={r => {
                    setAssessment(_prev => ({...assessment, resources: r}))
                  }}
                  onUpdateSurveyConfig={c => {
                    setSurvey(prev => ({...prev, config: c}))
                  }}
                  resources={assessment.resources}
                  surveyConfig={survey?.config}
                />
              )}
            </Route>
            <Route path={`/surveys/:id/design/question`}>
              <Box
                py={0}
                pr={3}
                pl={2}
                textAlign="center"
                height="100%"
                flexGrow="1"
                bgcolor={'#fff'}>
                <QuestionEdit
                  onChange={step => updateCurrentStep(step)}
                  step={getCurrentStep()}
                />
              </Box>
              <Box height="100%" bgcolor={'#f8f8f8'}>
                <QuestionEditRhs
                  step={getCurrentStep()!}
                  onChange={(step: Step) => updateCurrentStep(step)}
                />
                {/*<ControlSelector
                  step={getCurrentStep()!}
                  onChange={step => updateCurrentStep(step)}
                />*/}
              </Box>
            </Route>

            <Route path={`/surveys/:id/design/completion`}>
              <div>!!!completion</div>
            </Route>
            <Route path={`/surveys/:id/design/intro`}>
              <IntroInfo
                surveyAssessment={assessment}
                survey={survey}
                onUpdate={saveAssessment}></IntroInfo>
            </Route>
            <Route path="">
              <Redirect to={`/surveys/${guid}/design/intro`}></Redirect>
            </Route>
          </Switch>
        </Box>
        {/* SAVE BUTTON AREA*/}
        {isTitleScreen() && (
          <ActionButton
            startIcon={<SaveIcon />}
            variant="text"
            sx={{
              position: 'absolute',
              top: theme.spacing(3),
              right: theme.spacing(3),
              textAlign: 'right',
            }}>
            Save Changes
          </ActionButton>
        )}
      </SurveyDesignContainerBox>
    </Loader>
  )
}
export default SurveyDesign
