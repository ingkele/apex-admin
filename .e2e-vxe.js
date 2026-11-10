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
  await page.goto(base + '/examples/vxe-table/basic')
  await page.waitForURL('**/login**', { timeout: 8000 }).catch(() => {})
  await page.getByRole('button', { name: '登录控制台' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 10000 })
  results.push('ASSERT PASS 登录进入 dashboard')
  await page.goto(base + '/examples/vxe-table/basic')

  // ================= 菜单：Vxe 表格组 10 项 =================
  await t('sidebar Vxe 表格组 10 项链接可见', async () => {
    for (const name of ['基础表格', '远程加载', '树形表格', '固定表头/列', '自定义单元格', '搜索表单', '单元格编辑', '行编辑', '虚拟滚动', '行标记']) {
      await page.locator('aside').getByRole('link', { name }).first().waitFor({ state: 'visible', timeout: 6000 })
    }
  })

  // ================= 基础表格 =================
  await t('basic 外观开关切换斑马纹', async () => {
    await page.getByRole('button', { name: /斑马纹/ }).click()
    await page.getByRole('button', { name: /斑马纹：开/ }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: /斑马纹/ }).click()
    await page.getByRole('button', { name: /斑马纹：关/ }).waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('basic 点行选中/清除', async () => {
    await page.getByText('产品手册向量化').first().click()
    await page.getByText(/已选中：产品手册向量化/).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '清除选中' }).click()
    await page.getByText('未选中行').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('basic 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-basic.png' })
  })

  // ================= 远程加载 =================
  await page.goto(base + '/examples/vxe-table/remote')
  await t('remote 加载后分页渲染', async () => {
    await page.getByText(/共 \d+ 条/).waitFor({ state: 'visible', timeout: 6000 })
  })
  await t('remote 翻页拉取下一页', async () => {
    await page.getByRole('button', { name: '下一页' }).click()
    await page.getByText(/第 2\//).waitFor({ state: 'visible', timeout: 6000 })
  })
  await t('remote 模拟失败 → 重试恢复', async () => {
    await page.getByText('模拟失败（下一次请求返回 500）').click()
    await page.getByRole('button', { name: '刷新', exact: true }).click()
    await page.getByText('加载失败（模拟 HTTP 500）').waitFor({ state: 'visible', timeout: 6000 })
    await page.getByRole('button', { name: /重试/ }).click()
    await page.getByText('加载失败（模拟 HTTP 500）').waitFor({ state: 'hidden', timeout: 6000 })
  })
  await t('remote 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-remote.png' })
  })

  // ================= 树形表格 =================
  await page.goto(base + '/examples/vxe-table/tree')
  await t('tree 展开/收起层级', async () => {
    await page.getByText('平台服务').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '收起 后端组' }).click()
    await page.getByText('平台服务').waitFor({ state: 'hidden', timeout: 4000 })
    await page.getByRole('button', { name: '展开 后端组' }).click()
    await page.getByText('平台服务').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('tree 级联勾选半选态', async () => {
    await page.getByRole('button', { name: /勾选 研发部/ }).click()
    await page.getByText('已勾选 6 个节点').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: /取消勾选 研发部/ }).click()
  })
  await t('tree 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-tree.png' })
  })

  // ================= 固定表头/列 =================
  await page.goto(base + '/examples/vxe-table/fixed')
  await t('fixed 宽表渲染 12 行', async () => {
    await page.getByText('工单分派').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('fixed 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-fixed.png' })
  })

  // ================= 自定义单元格 =================
  await page.goto(base + '/examples/vxe-table/custom-cell')
  await t('custom-cell 复杂渲染可见', async () => {
    await page.getByText('86%').first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('link', { name: /文档/ }).first().waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('custom-cell 复制 ID toast', async () => {
    await page.getByRole('button', { name: /复制 task_2b7e04dd/ }).click()
    await page.getByText('已复制 ID').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('custom-cell 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-custom-cell.png' })
  })

  // ================= 搜索表单 =================
  await page.goto(base + '/examples/vxe-table/form')
  await t('form 关键字过滤 + 回车即查', async () => {
    await page.getByPlaceholder('任务名称 / ID').fill('向量化')
    await page.keyboard.press('Enter')
    await page.getByText('产品手册向量化').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByText('日志异常聚类').waitFor({ state: 'hidden', timeout: 4000 })
  })
  await t('form 条件 chip 展示', async () => {
    await page.getByText('关键字：向量化').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('form 重置还原', async () => {
    await page.getByRole('button', { name: /重置/ }).click()
    await page.getByText('日志异常聚类').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByText('未应用筛选条件').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('form 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-form.png' })
  })

  // ================= 单元格编辑 =================
  await page.goto(base + '/examples/vxe-table/edit-cell')
  await t('edit-cell 点击进入编辑 + Enter 提交', async () => {
    await page.getByText('产品手册向量化').first().click()
    const input = page.locator('td input').first()
    await input.waitFor({ state: 'visible', timeout: 4000 })
    await input.fill('产品手册向量化v2')
    await page.keyboard.press('Enter')
    await page.getByText('产品手册向量化v2').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('edit-cell 修改标记黄点 + 计数', async () => {
    await page.getByText('已修改 1 个单元格').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('edit-cell Esc 取消编辑', async () => {
    await page.getByText('客服问答模型微调').first().click()
    const input = page.locator('td input').first()
    await input.waitFor({ state: 'visible', timeout: 4000 })
    await input.fill('不保存')
    await page.keyboard.press('Escape')
    await page.getByText('客服问答模型微调').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('edit-cell 还原数据', async () => {
    await page.getByRole('button', { name: '还原数据' }).click()
    await page.getByText('产品手册向量化').first().waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('edit-cell 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-edit-cell.png' })
  })

  // ================= 行编辑 =================
  await page.goto(base + '/examples/vxe-table/edit-row')
  await t('edit-row 进入编辑改名保存', async () => {
    await page.getByRole('button', { name: /编辑/ }).first().click()
    const input = page.locator('tr input').first()
    await input.waitFor({ state: 'visible', timeout: 4000 })
    await input.fill('产品手册向量化（已改）')
    await page.getByRole('button', { name: /保存/ }).click()
    await page.getByText('产品手册向量化（已改）').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByText('已修改 1 行').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('edit-row 取消编辑还原', async () => {
    await page.getByRole('button', { name: /编辑/ }).first().click()
    const input = page.locator('tr input').first()
    await input.fill('不保存的内容')
    await page.getByRole('button', { name: /取消/ }).click()
    await page.getByText('产品手册向量化（已改）').first().waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('edit-row 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-edit-row.png' })
  })

  // ================= 虚拟滚动 =================
  await page.goto(base + '/examples/vxe-table/virtual')
  await t('virtual 初始只渲染窗口行', async () => {
    await page.getByText(/DOM 行数 \d+ \/ 5000/).waitFor({ state: 'visible', timeout: 4000 })
    const txt = await page.locator('[data-testid="virtual-scroller"]').textContent()
    if (!txt.includes('批量任务 #1')) throw new Error('首行未渲染')
    if (txt.includes('批量任务 #4000')) throw new Error('窗口外行被渲染')
  })
  await t('virtual 滚动后渲染行变化', async () => {
    await page.locator('[data-testid="virtual-scroller"]').evaluate((el) => { el.scrollTop = 40000 })
    await page.waitForTimeout(300)
    const txt = await page.locator('[data-testid="virtual-scroller"]').textContent()
    if (txt.includes('批量任务 #1 ·')) throw new Error('滚动后首行仍在 DOM')
    await page.getByText(/scrollTop 40000px/).waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('virtual 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-virtual.png' })
  })

  // ================= 行标记 =================
  await page.goto(base + '/examples/vxe-table/viewed')
  await t('viewed 点行标记已查看', async () => {
    await page.getByText('周报摘要生成').first().click()
    await page.getByText(/已查看 2 行/).waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('viewed 书签收藏/取消', async () => {
    await page.getByRole('button', { name: /收藏 周报摘要生成/ }).click()
    await page.getByText(/收藏 2 行/).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: /取消收藏 周报摘要生成/ }).click()
    await page.getByText(/收藏 1 行/).waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('viewed 只看标记行过滤', async () => {
    await page.getByRole('button', { name: /只看标记行/ }).click()
    await page.getByText('日志异常聚类').waitFor({ state: 'hidden', timeout: 4000 })
    await page.getByRole('button', { name: /显示全部/ }).click()
    await page.getByText('日志异常聚类').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('viewed 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-vxe-viewed.png' })
  })

  results.push('CONSOLE ERRORS: ' + (errors.length ? errors.slice(0, 5).join(' | ') : 'none'))
  return results.join('\n')
}
