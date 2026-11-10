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
  await page.goto(base + '/examples/captcha/slider')
  await page.waitForURL('**/login**', { timeout: 8000 }).catch(() => {})
  await page.getByRole('button', { name: '登录控制台' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 10000 })
  results.push('ASSERT PASS 登录进入 dashboard')
  await page.goto(base + '/examples/captcha/slider')

  // ================= 菜单：验证码组 4 项 =================
  await t('sidebar 验证码组 4 项链接可见', async () => {
    for (const name of ['滑块验证', '旋转验证', '拼图滑块验证', '点选验证']) {
      await page.locator('aside').getByRole('link', { name }).first().waitFor({ state: 'visible', timeout: 6000 })
    }
  })

  // ================= 滑块验证 =================
  await t('slider 拖到错误位置 → 验证失败', async () => {
    const track = page.locator('[data-testid="captcha-slider"] [data-target]')
    const target = parseFloat(await track.getAttribute('data-target'))
    const box = await track.boundingBox()
    const travel = box.width - 56
    const h = await page.locator('[data-testid="captcha-slider-handle"]').boundingBox()
    const wrong = target > 35 ? target - 35 : target + 35
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 28 + (Math.max(2, Math.min(98, wrong)) / 100) * travel, h.y + h.height / 2, { steps: 8 })
    await page.mouse.up()
    await page.locator('[data-testid="captcha-status"]').getByText('验证失败').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('slider 拖到目标区 → 验证通过', async () => {
    const track = page.locator('[data-testid="captcha-slider"] [data-target]')
    const target = parseFloat(await track.getAttribute('data-target'))
    const box = await track.boundingBox()
    const travel = box.width - 56
    const h = await page.locator('[data-testid="captcha-slider-handle"]').boundingBox()
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 28 + (target / 100) * travel, h.y + h.height / 2, { steps: 10 })
    await page.mouse.up()
    await page.locator('[data-testid="captcha-status"]').getByText('验证通过').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('slider 验证记录留痕 ≥2 条', async () => {
    await page.locator('[data-testid="captcha-log"] > div').first().waitFor({ state: 'visible', timeout: 4000 })
    const n = await page.locator('[data-testid="captcha-log"] > div').count()
    if (n < 2) throw new Error('记录数 ' + n)
  })
  await t('slider 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-captcha-slider.png', fullPage: true })
  })

  // ================= 旋转验证 =================
  await page.goto(base + '/examples/captcha/rotate')
  await t('rotate 校验错误角度 → 验证失败', async () => {
    const offset = parseFloat(await page.locator('[data-testid="captcha-rotate-canvas"]').getAttribute('data-offset'))
    if (Math.min(offset, 360 - offset) < 12) throw new Error('随机角过小，跳过')
    await page.getByRole('button', { name: '校验角度' }).click()
    await page.locator('[data-testid="captcha-status"]').getByText('验证失败').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('rotate 拖到转正角度 → 校验通过', async () => {
    const offset = parseFloat(await page.locator('[data-testid="captcha-rotate-canvas"]').getAttribute('data-offset'))
    const user = (360 - offset) % 360
    const track = page.locator('[data-testid="captcha-rotate-handle"]').locator('..')
    const box = await track.boundingBox() // inner 行程区：width 即行程宽
    const h = await page.locator('[data-testid="captcha-rotate-handle"]').boundingBox()
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 22 + (user / 359) * box.width, h.y + h.height / 2, { steps: 12 })
    await page.mouse.up()
    await page.getByRole('button', { name: '校验角度' }).click()
    await page.locator('[data-testid="captcha-status"]').getByText('验证通过').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('rotate 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-captcha-rotate.png', fullPage: true })
  })

  // ================= 拼图滑块验证 =================
  await page.goto(base + '/examples/captcha/puzzle')
  await t('puzzle 拖到错误位置 → 验证失败', async () => {
    const scene = page.locator('[data-testid="captcha-puzzle"] [data-target]')
    const targetX = parseFloat(await scene.getAttribute('data-target'))
    const wrong = targetX > 174 ? targetX - 174 : targetX + 174
    const MAX_X = 348
    const track = page.locator('[data-testid="captcha-puzzle-handle"]').locator('..')
    const box = await track.boundingBox() // inner 行程区：width 即行程宽
    const h = await page.locator('[data-testid="captcha-puzzle-handle"]').boundingBox()
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 24 + (wrong / MAX_X) * box.width, h.y + h.height / 2, { steps: 8 })
    await page.mouse.up()
    await page.locator('[data-testid="captcha-status"]').getByText('验证失败').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('puzzle 拖到缺口 → 验证通过', async () => {
    const scene = page.locator('[data-testid="captcha-puzzle"] [data-target]')
    const targetX = parseFloat(await scene.getAttribute('data-target'))
    const MAX_X = 348
    const track = page.locator('[data-testid="captcha-puzzle-handle"]').locator('..')
    const box = await track.boundingBox() // inner 行程区：width 即行程宽
    const h = await page.locator('[data-testid="captcha-puzzle-handle"]').boundingBox()
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 24 + (targetX / MAX_X) * box.width, h.y + h.height / 2, { steps: 12 })
    await page.mouse.up()
    await page.locator('[data-testid="captcha-status"]').getByText('验证通过').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('puzzle 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-captcha-puzzle.png', fullPage: true })
  })

  // ================= 点选验证 =================
  await page.goto(base + '/examples/captcha/click')
  await t('click 点错图形 → 验证失败', async () => {
    const seq = JSON.parse(await page.locator('[data-testid="captcha-click-canvas"]').getAttribute('data-sequence'))
    const shapes = JSON.parse(await page.locator('[data-testid="captcha-click-canvas"]').getAttribute('data-shapes'))
    const wrong = shapes.find((s) => s.key !== seq[0])
    const c = await page.locator('[data-testid="captcha-click-canvas"]').boundingBox()
    await page.mouse.click(c.x + (wrong.cx / 520) * c.width, c.y + (wrong.cy / 240) * c.height)
    await page.locator('[data-testid="captcha-status"]').getByText('验证失败').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('click 按序点选 3 个 → 验证通过', async () => {
    const seq = JSON.parse(await page.locator('[data-testid="captcha-click-canvas"]').getAttribute('data-sequence'))
    const shapes = JSON.parse(await page.locator('[data-testid="captcha-click-canvas"]').getAttribute('data-shapes'))
    const c = await page.locator('[data-testid="captcha-click-canvas"]').boundingBox()
    for (const key of seq) {
      const s = shapes.find((x) => x.key === key)
      await page.mouse.click(c.x + (s.cx / 520) * c.width, c.y + (s.cy / 240) * c.height)
      await page.waitForTimeout(150)
    }
    await page.locator('[data-testid="captcha-status"]').getByText('验证通过').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('click 键盘按钮与画布点击等价（重新生成后按钮点选）', async () => {
    await page.getByRole('button', { name: '重新生成' }).click()
    const seq = JSON.parse(await page.locator('[data-testid="captcha-click-canvas"]').getAttribute('data-sequence'))
    const label = { circle: '圆形', star: '星形', triangle: '三角', heart: '心形', diamond: '菱形' }
    for (const key of seq) {
      await page.getByRole('button', { name: label[key], exact: true }).click()
      await page.waitForTimeout(120)
    }
    await page.locator('[data-testid="captcha-status"]').getByText('验证通过').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('click 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-captcha-click.png', fullPage: true })
  })

  // ================= 汇总 =================
  results.push('CONSOLE ERRORS: ' + (errors.length ? JSON.stringify(errors.slice(0, 8)) : 'NONE'))
  return results.join('\n')
}
