async () => {
  const results = []
  const t = async (name, fn) => {
    try { await fn(); results.push(['PASS', name]) }
    catch (e) { results.push(['FAIL', name + ': ' + (e && e.message ? e.message : e)]) }
  }
  const missing = () => page.evaluate(() => {
    const els = [...document.querySelectorAll('input,select,textarea')]
    return {
      total: els.length,
      bad: els.filter((el) => !el.id && !el.name).map((el) => el.outerHTML.slice(0, 90)),
    }
  })

  // 登录页
  await page.goto('http://localhost:5180/login')
  await page.getByRole('button', { name: '登录控制台' }).waitFor({ state: 'visible', timeout: 15000 })
  await t('登录页 0 缺失', async () => {
    const m = await missing()
    if (m.total < 3) throw new Error('表单控件太少: ' + m.total)
    if (m.bad.length) throw new Error('缺失 ' + m.bad.length + ': ' + JSON.stringify(m.bad))
  })

  // 登录链
  await page.getByRole('button', { name: '登录控制台' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 10000 })

  // tasks 页（裸 checkbox/日期框）
  await page.goto('http://localhost:5180/tasks')
  await page.getByText('任务 ID').first().waitFor({ state: 'visible', timeout: 15000 })
  await t('tasks 页 0 缺失', async () => {
    const m = await missing()
    if (m.total < 4) throw new Error('表单控件太少: ' + m.total)
    if (m.bad.length) throw new Error('缺失 ' + m.bad.length + ': ' + JSON.stringify(m.bad))
  })

  // system/settings（Input 组件 useId 兜底）
  await page.goto('http://localhost:5180/system/settings')
  await t('settings 页 0 缺失', async () => {
    let m = { total: 0, bad: [] }
    for (let i = 0; i < 24; i++) {
      m = await missing()
      if (m.total > 0) break
      await page.waitForTimeout(500)
    }
    if (m.total < 1) throw new Error('表单控件太少: ' + m.total)
    if (m.bad.length) throw new Error('缺失 ' + m.bad.length + ': ' + JSON.stringify(m.bad))
  })

  // 表单示例页（Input 组件密集）
  await page.goto('http://localhost:5180/examples/form/basic')
  await t('form/basic 页 0 缺失', async () => {
    let m = { total: 0, bad: [] }
    for (let i = 0; i < 24; i++) {
      m = await missing()
      if (m.total > 0) break
      await page.waitForTimeout(500)
    }
    if (m.total < 3) throw new Error('表单控件太少: ' + m.total)
    if (m.bad.length) throw new Error('缺失 ' + m.bad.length + ': ' + JSON.stringify(m.bad))
  })

  return results.map((r) => r.join(' | ')).join('\n')
}
