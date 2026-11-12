async () => {
  const results = []
  const t = async (name, fn) => {
    try { await fn(); results.push(['PASS', name]) }
    catch (e) { results.push(['FAIL', name + ': ' + (e && e.message ? e.message : e)]) }
  }
  const GH = 'https://github.com/ingkele/apex-admin'
  const GT = 'https://gitee.com/guangxi-witchc-network/apex-admin'
  const OUT = 'F:/WorkBuddy/2026-11-07-23-19-58/apex-admin/outputs/'

  // 登录链
  await page.goto('http://localhost:5180/about')
  await page.waitForURL('**/login**', { timeout: 10000 })
  await page.getByRole('button', { name: '登录控制台' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 10000 })

  // 顶栏链接（全局）
  await t('顶栏 GitHub 图标链接', async () => {
    const a = page.locator(`header a[href="${GH}"]`)
    await a.first().waitFor({ state: 'visible', timeout: 8000 })
  })
  await t('顶栏 Gitee 图标链接', async () => {
    const a = page.locator(`header a[href="${GT}"]`)
    await a.first().waitFor({ state: 'visible', timeout: 8000 })
  })

  // 关于页（等渲染完成再断言）
  await page.goto('http://localhost:5180/about')
  await page.waitForURL('**/about**', { timeout: 10000 })
  await page.getByText('构建号 build').first().waitFor({ state: 'visible', timeout: 15000 })
  await t('关于页 GitHub 链接两处', async () => {
    const n = await page.locator(`a[href="${GH}"]`).count()
    if (n < 2) throw new Error('期望 Hero+LINKS 两处，实际 ' + n)
  })
  await t('关于页 Gitee 链接两处', async () => {
    const n = await page.locator(`a[href="${GT}"]`).count()
    if (n < 2) throw new Error('期望 Hero+LINKS 两处，实际 ' + n)
  })
  await t('LINKS 卡片 GitHub 项 target=_blank', async () => {
    const n = await page.locator(`a[href="${GH}"][target="_blank"]`).count()
    if (n < 1) throw new Error('无 target=_blank 链接')
  })
  await t('LINKS 卡片标题渲染', async () => {
    await page.getByText('GitHub 仓库').first().waitFor({ state: 'visible', timeout: 5000 })
    await page.getByText('Gitee 仓库').first().waitFor({ state: 'visible', timeout: 5000 })
  })
  await page.screenshot({ path: OUT + 'about-links.png', fullPage: true })

  // 顶栏特写
  await page.goto('http://localhost:5180/dashboard')
  await page.waitForURL('**/dashboard**', { timeout: 10000 })
  await page.locator(`header a[href="${GH}"]`).first().waitFor({ state: 'visible', timeout: 8000 })
  await page.screenshot({ path: OUT + 'topbar-links.png', clip: { x: 0, y: 0, width: 1600, height: 72 } })

  console.log(JSON.stringify(results))
  return results
}
