async () => {
  const results = []
  const t = async (name, fn) => {
    try { await fn(); results.push(['PASS', name]) }
    catch (e) { results.push(['FAIL', name + ': ' + (e && e.message ? e.message : e)]) }
  }
  const OUT = 'F:/WorkBuddy/2026-11-07-23-19-58/apex-admin/outputs/'

  // 登录链（首次访问 system/terminal 触发重定向）
  await page.goto('http://localhost:5180/system/terminal')
  await page.waitForURL('**/login**', { timeout: 10000 })
  await page.getByRole('button', { name: '登录控制台' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 10000 })

  // 进入终端页（首次访问路由 chunk 按需编译，先等渲染再断言）
  await page.goto('http://localhost:5180/system/terminal')
  await page.getByTestId('terminal-input').waitFor({ state: 'visible', timeout: 15000 })
  await t('会话横幅渲染', async () => {
    await page.getByText('Apex Admin Mock Terminal · app-server-01').first().waitFor({ state: 'visible', timeout: 8000 })
  })
  await t('状态徽章显示已连接', async () => {
    const badge = page.getByTestId('terminal-status')
    await badge.waitFor({ state: 'visible', timeout: 5000 })
    const txt = await badge.textContent()
    if (!txt || !txt.includes('已连接')) throw new Error('徽章文本异常: ' + txt)
  })

  // help 命令输出
  await t('help 命令输出', async () => {
    await page.getByTestId('terminal-input').fill('help')
    await page.getByTestId('terminal-input').press('Enter')
    await page.getByText('Apex Mock Terminal 内置命令').first().waitFor({ state: 'visible', timeout: 5000 })
    await page.getByText('neofetch', { exact: false }).first().waitFor({ state: 'visible', timeout: 5000 })
  })

  // ↑ 历史命令回填
  await t('↑ 历史回填 help', async () => {
    await page.getByTestId('terminal-input').press('ArrowUp')
    const v = await page.getByTestId('terminal-input').inputValue()
    if (v !== 'help') throw new Error('期望 help，实际 ' + JSON.stringify(v))
  })

  // clear 清屏
  await t('clear 清屏', async () => {
    await page.getByTestId('terminal-input').fill('clear')
    await page.getByTestId('terminal-input').press('Enter')
    await page.getByText('已清屏 · 输入 help 查看可用命令').first().waitFor({ state: 'visible', timeout: 5000 })
  })

  await page.screenshot({ path: OUT + 'terminal.png', fullPage: true })

  // 主机切换 = 新会话
  await t('切换 db-server-02 出新横幅', async () => {
    await page.getByTestId('terminal-host-db-02').click()
    await page.getByText('Apex Admin Mock Terminal · db-server-02').first().waitFor({ state: 'visible', timeout: 5000 })
    await page.getByTestId('terminal-input').fill('hostname')
    await page.getByTestId('terminal-input').press('Enter')
    await page.getByText('db-server-02', { exact: true }).first().waitFor({ state: 'visible', timeout: 5000 })
  })

  await page.screenshot({ path: OUT + 'terminal-db.png', fullPage: true })

  console.log(JSON.stringify(results))
  return results
}
