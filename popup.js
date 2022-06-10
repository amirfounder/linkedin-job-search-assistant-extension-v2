// ----------------------------------------
// ----- CONSTANTS ------------------------
// ----------------------------------------



const MY_FNAME = 'Amir'
const MY_POSITION = 'Software Engineer'
const MY_TEL = `331.255.6927`
const MY_EMAIL = 'amirfounder18@gmail.com'

const POST_CONNECTION_MESSAGE = `\
Hi {fname}, thank you for accepting my connection request.

Please find my updated resume attached to this message.
If you think I may be a good fit for any position you or someone you know may be recruiting for, \
please feel free to reach out via phone, email or LinkedIn message and we can put some time on the calendar for a call.
I look forward to hearing from you!

{my_fname}
Tel: {my_tel}
Email: {my_email}`

const INIT_CONNECTION_MESSAGE = `\
Hello, {fname}!
My name is {my_fname} and I'm currently a {my_position}.
I saw your profile and wanted to reach out and introduce myself.
If you have time, I would love the opportunity to discuss how my \
skills and experience align with any open roles {company} is looking to fill.
Best,
{my_fname}`



const __init__ = () => {
  // ----------------------------------------
  // ----- ELEMENTS -------------------------
  // ----------------------------------------



  const NAME_INPT = document.querySelector('.name')
  const HEADING_INPT = document.querySelector('.heading')
  const COMPANY_INPT = document.querySelector('.company')
  const MSG_INPT = document.querySelector('.message')

  const HAS_INIT_CONN_MSG_BEEN_SENT_BTN = document.querySelector('.hasInitialConnectionMessageBeenSent')
  const IS_CONNECTED_CB = document.querySelector('.isConnected')

  const GEN_COPY_INIT_CONN_MSG_BTN = document.querySelector('.generateAndCopyInitialConnectionMessage')
  const GEN_COPY_POST_CONN_INTRO_MSG_BTN = document.querySelector('.generateAndCopyPostConnectionIntroMessage')
  const UPDATE_RECRUITER_PROFILE_BTN = document.querySelector('.updateRecruiterProfile')



  // ----------------------------------------
  // ----- STATE ----------------------------
  // ----------------------------------------



  const state = {
    nextAvailableCompany: null,
    profile: {
      username: null,
      name: null,
      headline: null,
      fname: null,
      company: null,
      touchpoints: {
        initial_connection: {
          created_at: null,
          updated_at: null,
          status: null
        },
        initial_connection_accepted: {
          created_at: null,
          updated_at: null,
          status: null
        },
        post_connection_intro_message: {
          created_at: null,
          updated_at: null,
          status: null
        },
        post_connection_follow_up_message: {
          created_at: null,
          updated_at: null,
          status: null
        }
      }
    }
  }

  

  // ----------------------------------------
  // ----- SERVICES -------------------------
  // ----------------------------------------



  const now = () => new Date().toISOString()
  const copy = (s) => navigator.clipboard.writeText(s)

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

  const generateInitialConnectionMessage = () => (
    INIT_CONNECTION_MESSAGE
      .replaceAll('{fname}', state.profile.fname)
      .replaceAll('{company}', state.profile.company)
      .replaceAll('{my_fname}', MY_FNAME)
      .replaceAll('{my_position}', MY_POSITION)
  )

  const generatePostConnectionIntroMessage = () => (
    POST_CONNECTION_MESSAGE
      .replaceAll('{fname}', state.profile.fname)
      .replaceAll('{my_fname}', MY_FNAME)
      .replaceAll('{my_tel}', MY_TEL)
      .replaceAll('{my_email}', MY_EMAIL)
  )

  const generateAndCopyPostConnectionIntroMessage = () => {
    const msg = generatePostConnectionIntroMessage()
    MSG_INPT.value = msg
    copy(msg)
  }

  const generateAndCopyInitialConnectionMessage = () => {
    const msg = generateInitialConnectionMessage()
    MSG_INPT.value = msg
    copy(msg)
  }

  const postProfile = async () => {
    httpRequest('POST', '/recruiters', state.profile)
  }

  const updateProfile = async () => {
    syncFromDomToState()
    httpRequest('PUT', '/recruiters/' + state.profile.username, state.profile)
  }

  const getProfile = async () => {
    httpRequest('GET', '/recruiters/' + state.profile.username)
      .then(r => {
        if (r.ok) {
          return r.json()
        } else if (r.status === 404) {
          initScript().then(postProfile)
        } else {
          throw Error(r.statusText)
        }
      })
      .then(data => { Object.assign(state.profile, data) })
      .then(syncStateToDOM)
  }

  const getNextAvailableCompany = async () => {
    httpRequest('GET', '/companies/next')
      .then(r => r.json())
      .then(data => { state.nextAvailableCompany = data })
      .then(syncStateToDOM)
  }

  const syncFromStateToDom = () => {
    NAME_INPT.value = state.profile.name
    HEADING_INPT.value = state.profile.headline
    COMPANY_INPT.value = state.profile.company
  }

  const syncFromDomToState = () => {
    state.profile.name = NAME_INPT.value
    state.profile.headline = HEADING_INPT.value
    state.profile.company = COMPANY_INPT.value
    state.profile.fname = state.profile.name?.split(' ').at(0)
  }



  // ----------------------------------------
  // ----- EVENT HANDLERS -------------------
  // ----------------------------------------



  GEN_COPY_INIT_CONN_MSG_BTN.addEventListener('click', generateAndCopyInitialConnectionMessage)
  GEN_COPY_POST_CONN_INTRO_MSG_BTN.addEventListener('click', generateAndCopyPostConnectionIntroMessage)



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
    syncFromStateToDom()
    setMessageValue()
  })



  // ---------------------------
  // ----- INIT ----------------
  // ---------------------------



  const initScript = async () => {
    return chrome.tabs
      .query({active: true, currentWindow: true})
      .then(([tab]) => {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          function: scrapeLinkedInProfilePage
        })
      })
  }

  initScript()
}

document.querySelector('.resync').addEventListener('click', __init__)

__init__()