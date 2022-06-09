const MESSAGE = `\
Hello, {fname}!

My name is Amir and I'm currently a Software Engineer.
I saw your profile and wanted to reach out and introduce myself.
If you have time, I would love the opportunity to discuss how my \
skills and experience align with any open roles {company} is looking to fill.

Best,
Amir`

const httpRequest = (method, route, body) => {
  fetch('http://localhost:8082' + route, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  })
    .then(console.log)
    .catch(console.warn)
}

const nameElement = document.querySelector('.name__input')
const headlineElement = document.querySelector('.headline__input')
const companyElement = document.querySelector('.company__input')
const messageElement = document.querySelector('.message__input')

const copyToClipboardButton = document.querySelector('#copyMessageToClipboard')
const saveRecruiterProfileButton = document.querySelector('.saveRecruiterProfile')
const markInitialConnectionRequestSentButton = document.querySelector('.markInitialConnectionRequestSent')

const state = {
  profile: {
    username: null,
    name: null,
    headline: null,
    fname: null,
    company: null,
    touchpoints: {
      initial_connection: {
        has_been_sent: null,
        timestamp_sent: null
      }
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  Object.assign(state.profile, request)
  state.profile.fname = state.profile.name?.split(' ').at(0)
  setNameInputValue()
  setCompanyInputValue()
  setHeadlineInputValue()
  setMessageValue()
})

const setNameInputValue = () => { nameElement.value = state.profile.name || '' }
const setCompanyInputValue = () => { companyElement.value = state.profile.company || '' }
const setHeadlineInputValue = () => { headlineElement.value = state.profile.headline || '' }
const setMessageValue = () => { messageElement.value = calculateMessage(state.profile.fname, state.profile.company) }

const calculateMessage = () => {
  return MESSAGE.replace('{fname}', state.profile.fname).replace('{company}', state.profile.company)
}

const copyMessageToClipboard = () => {
  navigator.clipboard.writeText(messageElement.value)
}

const getProfileData = async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: getProfileDataScript
  })
}

const getProfileDataScript = () => {
  const data = {
    linkedin_url: window.location.href,
    username: window.location.href.split('?').at(0).split('linkedin.com/in/').at(1).replace('/', ''),
    name: document.querySelector('h1')?.innerText,
    headline: document.querySelector('h1').parentElement.nextElementSibling?.innerText,
    company: document.querySelector('a[href="#experience"]')?.innerText
  }
  chrome.runtime.sendMessage(data)
}

copyToClipboardButton.addEventListener('click', copyMessageToClipboard)
markInitialConnectionRequestSentButton.addEventListener('click', () => {
  try {
    state.profile.touchpoints.initial_connection.has_been_sent = true
    state.profile.touchpoints.initial_connection.timestamp_sent = new Date().toISOString()
    httpRequest('POST', '/recruiters/save', state.profile)
  } catch (err) {
    console.error(String(err))
  }
})

getProfileData()