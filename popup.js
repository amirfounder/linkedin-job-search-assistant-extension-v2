// ----------------------------------------
// ----- CONSTANTS ------------------------
// ----------------------------------------



const MY_FNAME = 'Amir'
const MY_NAME = 'Amir Sharapov'
const MY_POSITION = 'Software Engineer'
const MY_TEL = `331.255.6927`
const MY_EMAIL = 'amirfounder18@gmail.com'
const INIT_CONNECTION_MESSAGE_RECRUITER = `\
Hello, {fname}!

My name is {my_fname} and I'm currently a {my_position}.
I saw your profile and wanted to reach out and introduce myself.
If you have time, I would love the opportunity to discuss how my \
skills and experience align with any open roles {company} is looking to fill.

Best,
{my_fname}`
const POST_CONNECTION_MESSAGE_RECRUITER = `\
Hi {fname}, thank you for accepting my connection request!

Please find my updated resume attached to this message.
If you think I may be a good fit for any position you or someone you know may be recruiting for, \
please feel free to reach out via phone, email or LinkedIn message \
and we can put some time on the calendar for a call.
I look forward to hearing from you!

{my_name}
Tel: {my_tel}
Email: {my_email}`
const INIT_CONNECTION_MESSAGE_SWE = `\
Hello, {fname}!

My name is {my_fname} and I'm currently a {my_position}.
I saw your profile and wanted to reach out and introduce myself.
If you have time, I would love the opportuntity to learn more about your \
day to day experience as a {headline} at {company}.

Best,\
Amir`



const __init__ = () => {

  // ----------------------------------------
  // ----- HELPERS -------------------------
  // ----------------------------------------



  const now = () => new Date().toISOString()
  const copy = (s) => navigator.clipboard.writeText(s)
  const getElement = (selector) => document.querySelector(selector)



  // ----------------------------------------
  // ----- ELEMENTS -------------------------
  // ----------------------------------------



  const NAME_INPT = getElement('.name')
  const HEADLINE_INPT = getElement('.headline')
  const COMPANY_INPT = getElement('.company')
  const MSG_INPT = getElement('.message')

  const HAS_INIT_CONN_MSG_BEEN_SENT_BTN = getElement('.hasInitialConnectionMessageBeenSent')
  const IS_CONNECTED_CB = getElement('.isConnected')

  const GEN_COPY_INIT_CONN_MSG_BTN = getElement('.generateAndCopyInitialConnectionMessage')
  const GEN_COPY_POST_CONN_INTRO_MSG_BTN = getElement('.generateAndCopyPostConnectionMessage')
  const UPDATE_RECRUITER_PROFILE_BTN = getElement('.updateRecruiterProfile')
  const FETCHING_PROFILE_DATA_STATUS = getElement('.fetchingProfileDataStatus')



  // ----------------------------------------
  // ----- STATE ----------------------------
  // ----------------------------------------


  
  const state = {
    nextAvailableCompany: null,
    fetchingStatus: null,
    recruiter: {
      profile: {
        username: null,
        name: null,
        headline: null,
        fname: null,
        company: null,
      },
      touchpoints: {
        initial_connection_message_sent: {
          value: false
        },
        initial_connection_accepted: {
          value: false
        },
        post_connection_message_sent: {
          value: false
        },
        post_connection_follow_up_message: {
          value: false
        },
        post_connection_message_responded: {
          value: false
        },
        resume_sent: {
          value: false
        },
        initial_call_occured: {
          value: false
        }
      }
    }
  }

  const setFetchingProfileDataStatus = (status) => {
    FETCHING_PROFILE_DATA_STATUS.innerText = `(${status})` 
  }

  const syncTouchpointsFromStateToDom = () => {
    
  }

  const syncProfileFromStateToDom = () => {
    NAME_INPT.value = state.profile.name
    HEADLINE_INPT.value = state.profile.headline
    COMPANY_INPT.value = state.profile.company
  }

  const syncProfileFromDomToState = () => {
    state.profile.name = NAME_INPT.value
    state.profile.headline = HEADLINE_INPT.value
    state.profile.company = COMPANY_INPT.value
    state.profile.fname = state.profile.name?.split(' ').at(0)
  }



  // ----------------------------------------
  // ----- MESSAGES -------------------------
  // ----------------------------------------



  const generateInitialConnectionMessage = () => (
    INIT_CONNECTION_MESSAGE_RECRUITER
      .replaceAll('{fname}', state.profile.fname)
      .replaceAll('{company}', state.profile.company)
      .replaceAll('{my_fname}', MY_FNAME)
      .replaceAll('{my_position}', MY_POSITION)
  )

  const generatePostConnectionIntroMessage = () => (
    POST_CONNECTION_MESSAGE_RECRUITER
      .replaceAll('{fname}', state.profile.fname)
      .replaceAll('{my_name}', MY_NAME)
      .replaceAll('{my_tel}', MY_TEL)
      .replaceAll('{my_email}', MY_EMAIL)
  )

  const generateAndCopyPostConnectionMessage = () => {
    const msg = generatePostConnectionIntroMessage()
    MSG_INPT.value = msg
    copy(msg)
  }

  const generateAndCopyInitialConnectionMessage = () => {
    const msg = generateInitialConnectionMessage()
    MSG_INPT.value = msg
    copy(msg)
  }



  // ----------------------------------------
  // ----- SERVICES -------------------------
  // ----------------------------------------



  const httpRequest = async (method, route, body) => {
    return fetch('http://localhost:8082' + route, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(body)
    })
  }

  const postProfile = async () => {
    httpRequest('POST', '/recruiters', state.profile)
  }

  const putProfile = async () => {
    syncProfileFromDomToState()
    httpRequest('PUT', '/recruiters/' + state.profile.username, state.profile)
  }

  const fetchProfileData = async () => {
    httpRequest('GET', '/recruiters/' + state.profile.username)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else if (response.status === 404) {
          initScript()
            .then(postProfile)
            .then(() => setFetchingProfileDataStatus('Completed - Created New'))
        } else {
          throw Error(response.statusText)
        }
      })
      .then(data => {
        Object.assign(state.profile, data)
        syncProfileFromStateToDom()
        setFetchingProfileDataStatus('Done')
      })
      .then(syncProfileFromStateToDom)
  }

  const getNextAvailableCompany = async () => {
    httpRequest('GET', '/companies/next')
      .then(r => r.json())
      .then(data => { state.nextAvailableCompany = data })
      .then(syncProfileFromStateToDom)
  }



  // ----------------------------------------
  // ----- EVENT HANDLERS -------------------
  // ----------------------------------------



  NAME_INPT.addEventListener('change', syncProfileFromDomToState)
  HEADLINE_INPT.addEventListener('change', syncProfileFromDomToState)
  COMPANY_INPT.addEventListener('change', syncProfileFromDomToState)


  GEN_COPY_INIT_CONN_MSG_BTN.addEventListener('click', generateAndCopyInitialConnectionMessage)
  GEN_COPY_POST_CONN_INTRO_MSG_BTN.addEventListener('click', generateAndCopyPostConnectionMessage)



  // ----------------------------------------
  // ----- CONTENT SCRIPTS ------------------
  // ----------------------------------------



  const scrapeLinkedInProfilePage = () => {
    chrome.runtime.sendMessage({
      linkedin_url: window.location.href,
      username: window.location.href.split('?').at(0).split('linkedin.com/in/').at(1).replace('/', ''),
      name: document.querySelector('h1')?.innerText,
      headline: document.querySelector('h1').parentElement.nextElementSibling?.innerText,
      company: document.querySelector('a[href="#experience"]')?.innerText
    })
  }



  // ----------------------------------------
  // ----- MESSAGE LISTENERS ----------------
  // ----------------------------------------



  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    Object.assign(state.profile, request)
    const now_ = now()
    state.profile.fname = state.profile.name?.split(' ').at(0)
    state.profile.created_at = now_
    state.profile.updated_at = now_
    syncProfileFromStateToDom()
  })



  // ---------------------------
  // ----- INIT ----------------
  // ---------------------------



  const initScript = async () => {
    chrome.tabs
      .query({active: true, currentWindow: true})
      .then(([tab]) => {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          function: scrapeLinkedInProfilePage
        })
      })
      .then(fetchProfileData)
  }

  initScript()
}

document.querySelector('.resync').addEventListener('click', __init__)

__init__()