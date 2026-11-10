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
  await page.goto(base + '/examples/form/basic')
  await page.waitForURL('**/login**', { timeout: 8000 }).catch(() => {})
  await page.getByRole('button', { name: '登录控制台' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 10000 })
  results.push('ASSERT PASS 登录进入 dashboard')
  await page.goto(base + '/examples/form/basic')

  // ================= 菜单：表单组 14 项 =================
  await t('sidebar 表单组 14 项链接可见', async () => {
    for (const name of ['基础表单', '查询表单', '值格式化', '表单校验', '动态表单', '自定义布局', '自定义组件', 'Api', '合并表单', '滚动到错误字段', '单项表单折叠', 'Label 自动宽度', '表单数组', 'Demo']) {
      await page.locator('aside').getByRole('link', { name }).first().waitFor({ state: 'visible', timeout: 6000 })
    }
  })

  // ================= 基础表单 =================
  await t('basic 空表单提交 → 必填错误', async () => {
    await page.getByRole('button', { name: '提交', exact: true }).click()
    await page.getByText('请输入用户名').first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByText('请输入邮箱').first().waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('basic 填写后提交 → 载荷预览', async () => {
    await page.getByPlaceholder('如 zhangsan').fill('zhangsan')
    await page.getByPlaceholder('如 张三').fill('张三')
    await page.getByPlaceholder('name@company.com').first().fill('zhangsan@apex.ai')
    await page.getByRole('button', { name: '提交', exact: true }).click()
    await page.getByText('"username": "zhangsan"').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('basic 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-form-basic.png' })
  })

  // ================= 查询表单 =================
  await page.goto(base + '/examples/form/search')
  await t('search 关键字过滤联动', async () => {
    await page.getByPlaceholder('任务名称 / ID').fill('向量化')
    await page.getByRole('button', { name: '查询', exact: true }).click()
    await page.getByText('产品手册向量化').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByText('日志异常聚类').waitFor({ state: 'hidden', timeout: 4000 })
  })
  await t('search 展开/收起筛选', async () => {
    await page.getByRole('button', { name: '展开筛选' }).click()
    await page.getByText('任务类型').first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '收起筛选' }).click()
    await page.getByRole('button', { name: '展开筛选' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '重置', exact: true }).click()
    await page.getByText('日志异常聚类').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('search 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-form-search.png' })
  })

  // ================= 值格式化 =================
  await page.goto(base + '/examples/form/value-format')
  await t('format 初始载荷 123456 分', async () => {
    await page.getByText('"amountFen": 123456').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('format 改金额实时转分 + 回填', async () => {
    await page.getByLabel('合同金额').fill('2,000.00')
    await page.getByText('"amountFen": 200000').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '回填演示' }).click()
    await page.waitForTimeout(300)
  })

  // ================= 表单校验（迁移页） =================
  await page.goto(base + '/examples/form/validation')
  await t('validation 空表单提交 → 错误提示', async () => {
    await page.getByRole('button', { name: '提交任务' }).click()
    await page.getByText('任务名称不能为空').waitFor({ state: 'visible', timeout: 4000 })
  })

  // ================= 动态表单 =================
  await page.goto(base + '/examples/form/dynamic')
  await t('dynamic 切模板字段跟着换', async () => {
    await page.getByText('开通账号').first().click()
    await page.getByText('服务器申请').last().click()
    await page.getByText('主机名').first().waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('dynamic 加字段/删字段', async () => {
    await page.getByRole('button', { name: '加字段' }).click()
    await page.getByText('自定义字段 2').first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '删除字段 自定义字段 2' }).click()
    await page.getByText('自定义字段 2').first().waitFor({ state: 'hidden', timeout: 4000 })
  })
  await t('dynamic 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-form-dynamic.png' })
  })

  // ================= 自定义布局 =================
  await page.goto(base + '/examples/form/layout')
  await t('layout 切 3 列激活态', async () => {
    await page.getByRole('button', { name: '3 列' }).click()
    const cls = await page.getByRole('button', { name: '3 列' }).getAttribute('class')
    if (!cls || !cls.includes('bg-brand-600')) throw new Error('3 列按钮未激活: ' + cls)
    await page.getByText('基础信息').first().waitFor({ state: 'visible', timeout: 4000 })
  })

  // ================= 自定义组件 =================
  await page.goto(base + '/examples/form/custom')
  await t('custom 星级评分交互', async () => {
    await page.getByRole('button', { name: '4 星' }).click()
    await page.getByText('4 星').first().waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('custom 色板选择激活态', async () => {
    await page.getByRole('button', { name: '颜色 #16a34a' }).click()
    const cls = await page.getByRole('button', { name: '颜色 #16a34a' }).getAttribute('class')
    if (!cls || !cls.includes('border-ink')) throw new Error('色块未激活: ' + cls)
  })

  // ================= Api =================
  await page.goto(base + '/examples/form/api')
  await t('api 省市级联异步加载', async () => {
    await page.getByText('北京市').first().click()
    await page.getByRole('option', { name: '广东省' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('option', { name: '广东省' }).click()
    const cityTrigger = page.locator('button').filter({ hasText: '请选择城市' })
    await cityTrigger.waitFor({ state: 'visible', timeout: 4000 })
    await cityTrigger.click()
    await page.getByRole('option', { name: '深圳市' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('option', { name: '深圳市' }).click()
    await page.getByText('已加载 3 个城市').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('api 失败模式 → 重试按钮', async () => {
    await page.getByPlaceholder('如 望京旗舰店').fill('望京旗舰店')
    await page.getByText('模拟接口失败').click()
    await page.getByRole('button', { name: '提交', exact: true }).click()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: '重试' }).waitFor({ state: 'visible', timeout: 6000 })
  })

  // ================= 合并表单 =================
  await page.goto(base + '/examples/form/merge')
  await t('merge 空提交拦截 → 补齐后合并提交', async () => {
    await page.getByRole('button', { name: '合并提交三个区块' }).click()
    await page.getByText('待完善').first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByPlaceholder('如 广西维烯网络').fill('维烯网络')
    await page.getByPlaceholder('name@company.com').fill('ops@witchc.cn')
    await page.getByPlaceholder('如 0771-8888888').fill('0771-8888888')
    await page.getByRole('button', { name: '合并提交三个区块' }).click()
    await page.getByText('"org"').waitFor({ state: 'visible', timeout: 4000 })
  })

  // ================= 滚动到错误字段 =================
  await page.goto(base + '/examples/form/scroll-to-error')
  await t('scroll 提交 → 错误摘要条直达', async () => {
    await page.getByRole('button', { name: '提交（体验错误定位）' }).click()
    await page.getByText('共 7 处错误').waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '项目名称' }).click()
    await page.waitForTimeout(500)
  })
  await t('scroll 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-form-scroll.png' })
  })

  // ================= 单项表单折叠 =================
  await page.goto(base + '/examples/form/collapse')
  await t('collapse 折叠/展开切换', async () => {
    await page.getByRole('button', { name: '全部折叠' }).click()
    await page.getByText('告警邮箱').waitFor({ state: 'hidden', timeout: 4000 })
    await page.getByRole('button', { name: '全部展开' }).click()
    await page.getByText('告警邮箱').waitFor({ state: 'visible', timeout: 4000 })
  })

  // ================= Label 自动宽度 =================
  await page.goto(base + '/examples/form/label-width')
  await t('label-width 固定宽度切换', async () => {
    await page.getByRole('button', { name: '120px' }).click()
    const cls = await page.getByRole('button', { name: '120px' }).getAttribute('class')
    if (!cls || !cls.includes('bg-brand-600')) throw new Error('120px 按钮未激活: ' + cls)
    await page.getByText('标签置顶（top）').waitFor({ state: 'visible', timeout: 4000 })
  })

  // ================= 表单数组 =================
  await page.goto(base + '/examples/form/array')
  await t('array 加行/删行', async () => {
    await page.getByRole('button', { name: '加一行' }).click()
    await page.getByRole('button', { name: '删除 第 3 行' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '删除 第 3 行' }).click()
    await page.getByRole('button', { name: '删除 第 3 行' }).waitFor({ state: 'hidden', timeout: 4000 })
  })
  await t('array 补齐第 2 行 → 提交数组载荷', async () => {
    await page.getByPlaceholder('姓名').nth(1).fill('李四')
    await page.getByPlaceholder('邮箱').nth(1).fill('lisi@apex.ai')
    await page.getByRole('button', { name: '提交', exact: true }).click()
    await page.getByText('"李四"').waitFor({ state: 'visible', timeout: 4000 })
  })

  // ================= Demo 分步向导 =================
  await page.goto(base + '/examples/form/demo')
  await t('demo 空步骤拦截 + 分步提交', async () => {
    await page.getByRole('button', { name: '下一步' }).click()
    await page.getByText('工作区名称').first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByPlaceholder('如 北极星项目').fill('北极星计划')
    await page.getByRole('button', { name: '下一步' }).click()
    await page.getByText('成员上限').first().waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '下一步' }).click()
    await page.getByRole('button', { name: '确认提交' }).waitFor({ state: 'visible', timeout: 4000 })
    await page.getByRole('button', { name: '确认提交' }).click()
    await page.getByText('"name": "北极星计划"').waitFor({ state: 'visible', timeout: 4000 })
  })
  await t('demo 截图', async () => {
    await page.screenshot({ path: OUT + 'examples-form-demo.png' })
  })

  // ================= 控制台错误 =================
  await t('控制台 0 错误', async () => {
    if (errors.length > 0) throw new Error(errors.slice(0, 3).join(' | '))
  })
  results.push('CONSOLE_ERROR_COUNT ' + errors.length)
  return results.join('\n')
}
