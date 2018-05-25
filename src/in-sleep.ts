const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time))
async function aaa() {
  await sleep(100)
}

aaa()