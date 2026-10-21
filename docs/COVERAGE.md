# 产品覆盖矩阵｜边界优先

核查日期：2026-10-21。这里的“覆盖”是文档主题覆盖，**不是功能已由作者真实登录测试的保证**。

| 维度 | 文档覆盖 | 原始证据 | 真实账号复现 |
|---|---|---|---|
| 官方登录与入口 | [01](../guides/01-get-started.md) | Meta 官方产品页 | 未验证 |
| 地区、设备、资格 | [02](../guides/02-availability.md) | Meta 下载/官方说明 | 未建立多地区样本 |
| 任务编排、只读任务 | [03](../guides/03-task-spec.md) | Meta Agent 介绍 | 教学任务范式 |
| 连接器与审批 | [04](../guides/04-connectors.md) | Meta Security 技术介绍 | 实际授权按钮因账号而异 |
| 调研与反证 | [05](../guides/05-web-research.md) | 教学编辑方法 | 样本集待收集 |
| 邮件、日程与文件 | [06](../guides/06-email-calendar.md)、[07](../guides/07-files-notes.md) | Meta 官方功能说明 | 未验证各连接器 |
| AI+IP、求职、一人公司 | [08](../guides/08-content-ip.md)、[09](../guides/09-job-hunting.md)、[10](../guides/10-small-business.md) | 编辑性工作流 | 客户案例未导入，未声称成果 |
| 支付、订购和预约 | [11](../guides/11-commerce-booking.md) | Meta 官宣及 AP 事故报道 | 仅建议模拟，不真付款 |
| 长任务及持续检查 | [12](../guides/12-recurring-goals.md) | Meta 技术文章 | 可用性待核实 |
| 失效排障与 ROI | [13](../guides/13-troubleshooting.md)、[14](../guides/14-pricing-value.md) | 教学方法 | 价格未固定声明 |
| Prompt injection 和安全 | [15](../guides/15-safety-injection.md)、[docs/SECURITY](SECURITY.md) | Meta 官方 + 独立媒体 | 没有生产账户红队实测 |
| 评测、迭代 | [16](../guides/16-evaluation.md)、[18](../guides/18-operations.md) | 可复用评测框架 | 数值 benchmark 尚未产生 |
| Muse Agent / Code / Wonder 区分 | [17](../guides/17-muse-ecosystem.md) | Meta 模型发布公告 | 配额不跨产品推断 |

## 如何判断“够全面”

未来用明确测量代替主观排名：

- 功能主题覆盖率 = 有实质教程的核心主题 / 维护者确定的需求主题全集。
- 一手来源覆盖率 = 含可靠一手依据的动态断言 / 需要来源的动态断言。
- 可复现率 = 至少一人成功、另一人重复成功的步骤 / 抽样步骤。
- 新鲜度 = 高变化条目在 SLA 内完成复核的比例。
- 安全缺陷密度 = 单位 100 个实测任务中发生的越权、泄漏或未确认写入次数。

当前没有足够竞品数据库或跨平台实测样本证明“全网最全”。把它作为长期目标，而非未经验证的公开宣传。
