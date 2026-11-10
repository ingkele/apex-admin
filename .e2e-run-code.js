async () => {
  const results = []
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  const t = async (name, fn) => {
    try { await fn(); results.push('ASSERT PASS ' + name) }
    catch (e) { results.push('ASSERT FAIL ' + name + ' :: ' + String(e).slice(0, 220)) }
  }
  const base = 'http://localhost:5180'
  const OUT = 'F:/WorkBuddy/2026-11-07-23-19-58/apex-admin/outputs/'
  page.setDefaultTimeout(15000)

  // ================= 登录 =================
  await page.goto(base + '/examples/table-ops')
  await page.waitForURL('**/login**', { timeout: 8000 }).catch(() => {})
  await page.getByRole('button', { name: /登录控制台/ }).click()
  await page.waitForURL('**/dashboard**', { timeout: 10000 })
  results.push('ASSERT PASS 登录进入 dashboard')
  await page.goto(base + '/examples/table-ops')
  for (const name of ['表格操作', '上下文菜单', '图片裁剪', '富文本编辑器']) {
    await t('sidebar链接可见: ' + name, async () => {
      await page.locator('aside').getByRole('link', { name }).first().waitFor({ state: 'visible', timeout: 8000 })
    })
  }

  // ================= 表格操作 =================
  await t('table 行展开→收起', async () => {
    await page.getByRole('button', { name: '展开详情' }).first().click()
    await page.getByRole('button', { name: '收起详情' }).first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '收起详情' }).first().click()
    await page.getByRole('button', { name: '展开详情' }).first().waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('table 更多操作下拉（复制 ID / 删除）', async () => {
    await page.getByRole('button', { name: '更多操作' }).first().click()
    await page.getByRole('button', { name: '复制 ID' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '删除', exact: true }).waitFor({ state: 'visible', timeout: 4000 })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  })
  await t('table 行选择→批量条出现', async () => {
    await page.locator('[aria-label^="选择 "]').first().click()
    await page.getByRole('button', { name: '批量导出' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '批量删除' }).waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('table 半选态 indeterminate', async () => {
    const mixed = await page.getByRole('checkbox', { name: '全选' }).evaluate((el) => el.indeterminate === true)
    if (!mixed) throw new Error('全选框未进入半选态')
  })
  await t('table 全选→批量删除二次确认', async () => {
    await page.getByRole('checkbox', { name: '全选' }).click()
    await page.getByRole('button', { name: '批量删除' }).click()
    await page.getByText(/确认删除 \d+ 条记录/).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '确认删除' }).click()
    await page.getByText(/确认删除 \d+ 条记录/).waitFor({ state: 'hidden', timeout: 4000 })
  })
  await t('table 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-table-ops.png' })
  })

  // ================= 上下文菜单 =================
  await page.goto(base + '/examples/context-menu')
  await t('ctx 卡片右键弹菜单', async () => {
    await page.getByText('服务卡片（在此右键）').click({ button: 'right' })
    await page.getByRole('menu').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('menuitem', { name: /打开/ }).waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('ctx 菜单截图', async () => {
    await page.screenshot({ path: OUT + 'examples-context-menu.png' })
  })
  await t('ctx Esc 关闭', async () => {
    await page.keyboard.press('Escape')
    await page.getByRole('menu').waitFor({ state: 'hidden', timeout: 4000 })
  })
  await t('ctx 文件格子右键→菜单项点击后关闭', async () => {
    await page.getByText('产品手册.pdf').click({ button: 'right' })
    await page.getByRole('menu').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('menuitem', { name: /预览/ }).click()
    await page.getByRole('menu').waitFor({ state: 'hidden', timeout: 4000 })
  })
  await t('ctx 点外部关闭', async () => {
    await page.getByText('服务卡片（在此右键）').click({ button: 'right' })
    await page.getByRole('menu').waitFor({ state: 'visible', timeout: 4000 })
    await page.mouse.click(700, 60)
    await page.getByRole('menu').waitFor({ state: 'hidden', timeout: 4000 })
  })

  // ================= 图片裁剪 =================
  await page.goto(base + '/examples/image-crop')
  await t('crop 裁剪输出 dataURL', async () => {
    await page.getByRole('button', { name: /裁剪/ }).click()
    await page.waitForTimeout(400)
    const src = await page.locator('img[src^="data:image/png"]').first().getAttribute('src')
    if (!src || !src.startsWith('data:image/png;base64,')) throw new Error('输出图不是 PNG dataURL')
  })
  await t('crop 拖拽画布不报错+复位', async () => {
    const box = await page.locator('img[alt="裁剪底图"]').locator('..').boundingBox()
    if (box) {
      const cx = box.x + box.width * 0.47
      const cy = box.y + box.height * 0.475
      await page.mouse.move(cx, cy)
      await page.mouse.down()
      await page.mouse.move(cx + 50, cy + 30, { steps: 5 })
      await page.mouse.up()
    }
    await page.getByRole('button', { name: /复位/ }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: /^裁剪$/ }).click()
    await page.waitForTimeout(400)
  })
  await t('crop 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-image-crop.png' })
  })

  // ================= 富文本编辑器 =================
  await page.goto(base + '/examples/rich-text')
  await t('rich 编辑区输入', async () => {
    const editor = page.locator('[contenteditable]').first()
    await editor.click()
    await page.keyboard.press('Control+a')
    await page.keyboard.type('第 6 批富文本断言 Hello')
    await page.waitForTimeout(200)
    const txt = await editor.innerText()
    if (!txt.includes('第 6 批富文本断言')) throw new Error('输入未生效: ' + txt.slice(0, 60))
  })
  await t('rich 工具栏加粗', async () => {
    await page.locator('button[title="加粗"]').click()
    await page.waitForTimeout(200)
  })
  await t('rich 查看 HTML 源码→返回编辑', async () => {
    await page.getByRole('button', { name: '查看 HTML 源码' }).click()
    await page.getByRole('button', { name: '返回编辑' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '复制 HTML' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.screenshot({ path: OUT + 'examples-rich-text.png' })
    await page.getByRole('button', { name: '返回编辑' }).click()
    await page.locator('[contenteditable]').first().waitFor({ state: 'visible', timeout: 4000 })
  })

  // ================= 控制台错误 =================
  await t('控制台 0 错误', async () => {
    if (errors.length > 0) throw new Error(errors.slice(0, 3).join(' | '))
  })
  results.push('CONSOLE_ERROR_COUNT ' + errors.length)
  return results.join('\n')
}
