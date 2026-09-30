/* Firewall 3D — the emails behind the phishing terminals.
 *
 * Walk up to a blue mail terminal (M on the map) and press E: the game shows
 * one of these and asks whether it is phishing. `clues` is what the verdict
 * screen explains afterwards, so every entry says *why*, not only *what*.
 * Keep a mix of phishing and genuine mail: spotting that something is safe is
 * part of the skill too.
 */
const FW_EMAILS = [
  {
    phish: true, from: "IT Helpdesk <helpdesk@micros0ft-support.com>",
    en: { subject: "Your password expires TODAY", body: "Your mailbox password expires in 1 hour. Click the link below to keep your account, or it will be deleted:\nhttp://micros0ft-login.co/reset" },
    zh: { subject: "你的密码今天到期", body: "你的邮箱密码将在 1 小时后到期。请点击下面的链接保留账户，否则账户将被删除：\nhttp://micros0ft-login.co/reset" },
    clues: {
      en: ["The sender's address uses a zero: micros0ft, not microsoft.", "It pushes you to hurry (\"1 hour\", \"will be deleted\").", "The link goes to a site that is not the real company's."],
      zh: ["发件人地址里用的是数字 0：micros0ft，而不是 microsoft。", "它催你赶快行动（“1 小时”“将被删除”）。", "链接指向的并不是这家公司的真实网站。"]
    }
  },
  {
    phish: true, from: "Bank Security <alert@secure-bank-verify.net>",
    en: { subject: "Unusual sign-in detected", body: "Dear Customer,\nWe have locked your account. To unlock it, reply with your card number and PIN." },
    zh: { subject: "检测到异常登录", body: "尊敬的客户：\n我们已锁定你的账户。如需解锁，请回复你的卡号和密码（PIN）。" },
    clues: {
      en: ["A real bank never asks for your PIN, by email or anywhere else.", "\"Dear Customer\" instead of your name.", "secure-bank-verify.net is not a bank's own address."],
      zh: ["真正的银行绝不会向你索要 PIN 密码，无论通过邮件还是其他方式。", "称呼是“尊敬的客户”，而不是你的名字。", "secure-bank-verify.net 并不是银行自己的地址。"]
    }
  },
  {
    phish: true, from: "Parcel Delivery <noreply@parcel-track-fee.info>",
    en: { subject: "Your parcel is waiting — fee $1.99", body: "We tried to deliver your parcel. Pay the $1.99 customs fee with your card to release it:\nhttp://parcel-track-fee.info/pay" },
    zh: { subject: "你的包裹待领取 —— 手续费 1.99 美元", body: "我们尝试投递你的包裹未果。请用银行卡支付 1.99 美元清关费后领取：\nhttp://parcel-track-fee.info/pay" },
    clues: {
      en: ["Were you expecting a parcel? The message is written to fit anyone.", "A tiny fee is a trick to get your card details.", "The link is not the delivery company's real website."],
      zh: ["你真的在等包裹吗？这条消息写得适用于任何人。", "一笔小额费用是骗取你银行卡信息的圈套。", "链接不是快递公司的真实网站。"]
    }
  },
  {
    phish: true, from: "Principal <principal.office2025@gmail.com>",
    en: { subject: "Urgent favour", body: "I am in a meeting and can't talk. Please buy five $50 gift cards and email me the codes. Keep this between us for now." },
    zh: { subject: "急事相求", body: "我在开会，不方便接电话。请帮我买五张 50 美元的礼品卡，把卡号发给我。这件事先别告诉别人。" },
    clues: {
      en: ["A personal Gmail address, not the school's own.", "Gift cards are a favourite way for scammers to take money.", "Asking you to keep it secret stops you from checking."],
      zh: ["用的是个人 Gmail 地址，而不是学校的邮箱。", "礼品卡是骗子最爱用的收钱方式。", "要求你保密，就是为了不让你去核实。"]
    }
  },
  {
    phish: true, from: "Prize Team <winner@win-big-now.xyz>",
    en: { subject: "Congratulations! You won a new phone", body: "You are our lucky winner! Open the attached file to claim your prize.", attach: "ClaimPrize.exe" },
    zh: { subject: "恭喜！你赢得了一部新手机", body: "你是我们的幸运儿！打开附件即可领奖。", attach: "ClaimPrize.exe" },
    clues: {
      en: ["You cannot win a competition you never entered.", "A .exe attachment is a program: opening it runs it.", "Too good to be true usually is."],
      zh: ["你从没参加过的比赛，不可能中奖。", ".exe 附件是程序：一打开就会运行。", "好得难以置信的事，通常都不是真的。"]
    }
  },
  {
    phish: true, from: "Shared Drive <no-reply@drive-share-docs.com>",
    en: { subject: "Document shared with you: Salaries_2025", body: "A colleague shared a file with you. To view it, open the attachment and click \"Enable macros\".", attach: "Salaries_2025.xlsm" },
    zh: { subject: "有人与你共享了文档：Salaries_2025", body: "一位同事与你共享了文件。要查看，请打开附件并点击“启用宏”。", attach: "Salaries_2025.xlsm" },
    clues: {
      en: ["\"Enable macros\" is how Melissa and many other macro viruses got in.", "A file about salaries is bait to make you curious.", "No name: which colleague?"],
      zh: ["“启用宏”正是 Melissa 等宏病毒入侵的方式。", "关于工资的文件是勾起好奇心的诱饵。", "没有名字：到底是哪位同事？"]
    }
  },
  {
    phish: false, from: "University Library <library@university.edu>",
    en: { subject: "Reminder: your book is due on Friday", body: "Hello Alex,\n\"Computer Networks\" is due back on Friday. You can renew it at the library desk or in the library app you already use." },
    zh: { subject: "提醒：你借的书周五到期", body: "Alex 你好：\n《计算机网络》将于周五到期。你可以在图书馆服务台，或在你平时用的图书馆应用里续借。" },
    clues: {
      en: ["It comes from the university's own address.", "It uses your name and a real detail you can check.", "No link to click, no password or payment asked for."],
      zh: ["来自大学自己的邮箱地址。", "用了你的名字，还有你能核实的具体信息。", "没有需要点击的链接，也不索要密码或付款。"]
    }
  },
  {
    phish: false, from: "Course Lecturer <lecturer@university.edu>",
    en: { subject: "Tomorrow's lab moves to Room 3.12", body: "Hi all,\nTomorrow's lab is in Room 3.12 instead of 2.05. Same time. Nothing to download or install." },
    zh: { subject: "明天的实验课改到 3.12 教室", body: "大家好：\n明天的实验课改在 3.12 教室，不在 2.05。时间不变。不需要下载或安装任何东西。" },
    clues: {
      en: ["The university address you would expect.", "Ordinary, checkable information with no pressure.", "No attachment, no link, nothing asked of you."],
      zh: ["来自你预期中的大学邮箱。", "普通、可核实的信息，没有施压。", "没有附件，没有链接，也没有要求你做什么。"]
    }
  },
  {
    phish: false, from: "IT Department <it@university.edu>",
    en: { subject: "Planned Wi-Fi maintenance on Saturday", body: "Campus Wi-Fi will be off from 8 to 10 am on Saturday for upgrades. You don't need to do anything." },
    zh: { subject: "周六 Wi-Fi 计划维护", body: "校园 Wi-Fi 将于周六上午 8 点至 10 点停用进行升级。你不需要做任何操作。" },
    clues: {
      en: ["Real IT notices tell you what will happen, not ask for your password.", "\"You don't need to do anything\" is the opposite of a phishing hook.", "It comes from the university's own domain."],
      zh: ["真正的 IT 通知只告诉你会发生什么，不会索要密码。", "“你不需要做任何操作”正好与钓鱼的诱饵相反。", "来自大学自己的域名。"]
    }
  },
  {
    phish: false, from: "Online Store <orders@shop.example.com>",
    en: { subject: "Your order #48213 has shipped", body: "Thanks for your order of 1 × USB-C cable. To track it, sign in to your account on our website or app as usual." },
    zh: { subject: "你的订单 #48213 已发货", body: "感谢你购买 1 条 USB-C 数据线。如需追踪，请像平时一样登录我们的网站或应用。" },
    clues: {
      en: ["It matches something you really ordered.", "It sends you to the site or app you already use, not a strange link.", "No urgency, no payment request."],
      zh: ["与你真实下过的订单相符。", "它让你去你平时用的网站或应用，而不是点陌生链接。", "没有催促，也没有付款要求。"]
    }
  }
];

if (typeof module !== "undefined") { module.exports = { FW_EMAILS }; }
