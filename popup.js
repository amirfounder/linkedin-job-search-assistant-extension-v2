const MESSAGE = `\
Hello, {fname}!
My name is Amir Sharapov and I am a Software Engineer II at Catalyte.
I saw your profile and wanted to reach out and introduce myself.
If you have the time, I would love the opportunity to discuss how my \
skills and experience align with any open roles at {company}.

Best,
Amir`

const nameElement = document.querySelector('.name__input')
const headlineElement = document.querySelector('.headline__input')
const companyElement = document.querySelector('.company__input')
const messageElement = document.querySelector('.message__input')
const copyToClipboardButton = document.querySelector('#copyMessageToClipboard')

const state = {
  profile: {
    name: null,
    headline: null,
    fname: null,
    company: null
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  state.profile = request
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

const calculateMessage = (fname, company) => {
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
    name: document.querySelector('h1')?.innerText,
    headline: document.querySelector('h1').parentElement.nextElementSibling?.innerText,
    company: document.querySelector('a[href="#experience"]')?.innerText,
  }
  chrome.runtime.sendMessage(data)
}

copyToClipboardButton.addEventListener('click', copyMessageToClipboard)

getProfileData()