chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(oldValue,newValue)
    chrome.runtime.sendMessage( '', {
      type: key,
      list: newValue
    });
  }
});