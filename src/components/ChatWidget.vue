<template>
  <div class="cs-chat">
    <!-- Floating button -->
    <button class="cs-toggle" @click="toggleOpen" :aria-expanded="isOpen">
      <span v-if="!isOpen">💬 Hỏi đáp</span>
      <span v-else>✖</span>
    </button>

    <!-- Panel -->
    <div v-show="isOpen" class="cs-panel">
      <header class="cs-header">
        <div class="cs-title">Trợ lý ChillStay</div>
        <small class="cs-sub">Tra cứu nhanh từ FAQ</small>
      </header>

      <main class="cs-body" ref="bodyRef">
        <div v-for="(m, i) in messages" :key="i" class="cs-msg" :class="m.role">
          <div class="cs-bubble" v-html="m.text"></div>
          <div v-if="m.related && m.related.length" class="cs-related">
            <div class="cs-related-title">Có thể liên quan:</div>
            <button v-for="(s, si) in m.related" :key="si" class="cs-chip" @click="quickAsk(s)">
              {{ displayChip(s) }}
            </button>
          </div>
        </div>

        <div v-if="isTyping" class="cs-msg bot">
          <div class="cs-bubble">Đang nhập…</div>
        </div>
      </main>

      <footer class="cs-input">
        <input
          v-model="draft"
          @keydown.enter.exact.prevent="send()"
          type="text"
          :placeholder="placeholder"
        />
        <button @click="send()">Gửi</button>
      </footer>

      <ul v-if="showSuggest" class="cs-suggest">
        <li v-for="(s, idx) in suggestions" :key="idx" @click="applySuggestion(s)">
          {{ s.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Fuse from 'fuse.js'

export default {
  name: 'ChatWidget',
  props: {
    faqUrl: { type: String, default: '/faq.json' },
    hotlineUrl: { type: String, default: '#' },
    placeholder: { type: String, default: 'Hỏi tôi về chính sách, tiện nghi, thanh toán…' },
    greeting: {
      type: String,
      default:
        'Chào bạn 👋 Mình là bot trả lời nhanh các thắc mắc về ChillStay. Bạn có thể gõ /help để xem lệnh nhanh, hoặc thử: “giờ nhận trả phòng?”, “thanh toán VietQR?”, “mã giảm giá?”.',
    },
  },
  data() {
    return {
      isOpen: false,
      draft: '',
      messages: [],
      rawFaq: [],
      fuse: null,
      isTyping: false,
      suggestions: [],
      storeKey: 'cs-chat-v1',
    }
  },
  mounted() {
    this.restoreState()
    this.init()
  },
  computed: {
    showSuggest() {
      return this.isOpen && this.draft.trim().length >= 2 && this.suggestions.length > 0
    },
  },
  methods: {
    async init() {
      try {
        const res = await fetch(this.faqUrl, { cache: 'no-store' })
        this.rawFaq = await res.json()

        // Chuẩn hoá sẵn dữ liệu (bỏ dấu) để tìm bao dung hơn
        const data = this.rawFaq.map((item) => ({
          ...item,
          qv_norm: (item.question_variants || []).map((v) => this.normalize(v)),
          ans_norm: this.normalize(item.answer || ''),
        }))

        this.fuse = new Fuse(data, {
          keys: [
            { name: 'qv_norm', weight: 0.7 },
            { name: 'ans_norm', weight: 0.3 },
          ],
          includeScore: true,
          threshold: 0.5, // nới lỏng
          minMatchCharLength: 1,
          ignoreLocation: true, // bỏ ảnh hưởng vị trí chuỗi
          findAllMatches: true,
        })

        if (!this.messages.length) {
          // seed greeting kèm quick chips
          this.messages.push({
            role: 'bot',
            text: this.greeting,
            related: [
              '/help',
              'giờ nhận trả phòng',
              'thanh toán như thế nào',
              'có mã giảm giá không',
              'có bữa sáng không',
              'xem tin tức',
            ],
          })
        }
      } catch (e) {
        console.error('FAQ load error', e)
        this.messages.push({
          role: 'bot',
          text: 'Không tải được FAQ. Hãy đảm bảo bạn đặt file <b>faq.json</b> trong thư mục <i>public/</i> của ứng dụng (đường dẫn /faq.json).',
        })
      }
      this.scrollToBottom()
      this.saveState()
    },

    normalize(str) {
      return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip accents
        .replace(/[đ]/g, 'd')
        .replace(/[Đ]/g, 'd')
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.bodyRef
        if (el) el.scrollTop = el.scrollHeight
      })
    },

    toggleOpen() {
      this.isOpen = !this.isOpen
      this.saveState()
      this.$nextTick(() => this.scrollToBottom())
      if (this.isOpen && !this.messages.length) {
        this.messages.push({ role: 'bot', text: this.greeting })
      }
    },

    quickAsk(text) {
      // Hỗ trợ chip điều hướng dạng OPEN::/path
      if (typeof text === 'string' && text.startsWith('OPEN::')) {
        const path = text.replace('OPEN::', '')
        this.navigateTo(path)
        return
      }
      this.draft = typeof text === 'string' ? text : text?.label || ''
      this.send()
    },

    applySuggestion(s) {
      this.draft = s.label
      this.send()
    },

    send() {
      const q = (this.draft || '').trim()
      if (!q) return

      // tin nhắn người dùng
      this.messages.push({ role: 'user', text: this.escapeHTML(q) })
      this.draft = ''
      this.suggestions = []
      this.isTyping = true
      this.scrollToBottom()

      setTimeout(() => {
        let reply
        if (q.startsWith('/')) {
          reply = this.handleCommand(q)
        } else {
          reply = this.answerFromFaq(q)
        }
        this.isTyping = false
        this.messages.push(reply)
        this.scrollToBottom()
        this.saveState()
      }, 300)
    },

    handleCommand(cmd) {
      const raw = cmd.trim()
      const parts = raw.split(/\s+/)
      const name = parts[0].toLowerCase()

      if (name === '/help') {
        const text = [
          '<b>Lệnh nhanh:</b>',
          '- /help — hiển thị trợ giúp',
          '- /faq — mở trang Câu hỏi thường gặp',
          '- /contact — mở trang Liên hệ',
          '- /open <trang> — mở nhanh, ví dụ: /open homestays | news | payment | faq | contact',
          '- /calc price=<giá> nights=<đêm> services=<phí_dịch_vụ> discount=<số hoặc %>',
          '- /clear — xoá lịch sử đoạn chat',
        ].join('<br/>')
        return { role: 'bot', text }
      }

      if (name === '/clear') {
        this.messages = []
        this.saveState()
        return { role: 'bot', text: 'Đã xoá lịch sử trò chuyện.' }
      }

      if (name === '/faq') {
        this.navigateTo('/faq')
        return { role: 'bot', text: 'Đã mở trang FAQ.' }
      }

      if (name === '/contact') {
        this.navigateTo('/contact')
        return { role: 'bot', text: 'Đã mở trang Liên hệ.' }
      }

      if (name === '/open') {
        const alias = (parts[1] || '').toLowerCase()
        const map = {
          homestays: '/all-homestays',
          all: '/all-homestays',
          news: '/tin-tuc',
          payment: '/payment',
          faq: '/faq',
          contact: '/contact',
          reviews: '/danh-gia',
          terms: '/terms',
          privacy: '/privacy',
        }
        const path = map[alias]
        if (path) {
          this.navigateTo(path)
          return { role: 'bot', text: `Đã mở trang: <i>${path}</i>` }
        }
        return {
          role: 'bot',
          text: 'Không nhận diện được trang cần mở. Thử: homestays, news, payment, faq, contact.',
        }
      }

      if (name === '/calc') {
        const args = raw.slice(5)
        const out = this.calculatePrice(args)
        return { role: 'bot', text: out }
      }

      return { role: 'bot', text: 'Không rõ lệnh. Gõ /help để xem trợ giúp.' }
    },

    calculatePrice(argstr) {
      // Hỗ trợ: price=, nights=, services=, discount= (10 hoặc 10%)
      const kv = {}
      ;(argstr || '').split(/[\s,]+/).forEach((p) => {
        const [k, v] = p.split('=')
        if (k && v) kv[k.trim().toLowerCase()] = v.trim().toLowerCase()
      })
      const parseMoney = (s) => {
        if (!s) return 0
        let x = s.replace(/[^0-9.,kKmMbB]/g, '')
        x = x.replace(/,/g, '')
        let n = parseFloat(x)
        if (isNaN(n)) return 0
        if (/[kK]$/.test(s)) n *= 1_000
        if (/[mM]$/.test(s)) n *= 1_000_000
        if (/[bB]$/.test(s)) n *= 1_000_000_000
        return n
      }
      const price = parseMoney(kv.price)
      const nights = parseFloat(kv.nights || '1') || 1
      const services = parseMoney(kv.services)
      const discountRaw = kv.discount || '0'
      let discount = 0
      if (/%$/.test(discountRaw)) {
        discount = (price * nights + services) * (parseFloat(discountRaw) / 100)
      } else {
        discount = parseMoney(discountRaw)
      }
      const total = price * nights + services - discount
      const fmt = (n) => n.toLocaleString('vi-VN')
      return `Tạm tính: <b>${fmt(total)}</b> VND<br/><small>(Giá ${fmt(price)} × ${nights} đêm) + dịch vụ ${fmt(services)} − giảm ${fmt(discount)}</small>`
    },

    answerFromFaq(query) {
      if (!this.fuse) {
        return {
          role: 'bot',
          text: 'Hệ thống đang khởi động, vui lòng thử lại sau 1–2 giây nhé.',
        }
      }
      const qNorm = this.normalize(query)
      const results = this.fuse.search(qNorm)
      if (!results.length) return this.noAnswer()

      const best = results[0]
      if ((best.score ?? 1) > 0.6) return this.noAnswer() // nới ngưỡng tự tin
      const item = best.item
      const related = results.slice(1, 5).map((r) => r.item.question_variants?.[0] || r.item.id)

      // Nếu có link trong FAQ, thêm nút mở trang
      if (item.link) {
        related.unshift(`OPEN::${item.link}`)
      }

      // Trả về HTML tin cậy từ chính file FAQ
      return { role: 'bot', text: `${item.answer}`, related }
    },

    noAnswer() {
      const text = `Xin lỗi mình chưa có thông tin cho câu hỏi này. Bạn có thể xem thêm trên trang phòng hoặc <a href="${this.hotlineUrl}" target="_blank">liên hệ CSKH</a>. Hoặc gõ <code>/help</code> để xem lệnh.`
      return { role: 'bot', text, related: ['OPEN::/faq', 'OPEN::/contact'] }
    },

    displayChip(s) {
      return typeof s === 'string' && s.startsWith('OPEN::') ? 'Mở trang liên quan' : s
    },

    escapeHTML(str) {
      const div = document.createElement('div')
      div.textContent = str
      return div.innerHTML
    },

    navigateTo(path) {
      try {
        this.$router && this.$router.push(path)
      } catch {
        window.location.href = path
      }
    },

    saveState() {
      try {
        const state = { isOpen: this.isOpen, messages: this.messages }
        localStorage.setItem(this.storeKey, JSON.stringify(state))
      } catch (err) {
        console.warn('ChatWidget saveState error', err)
      }
    },

    restoreState() {
      try {
        const raw = localStorage.getItem(this.storeKey)
        if (!raw) return
        const state = JSON.parse(raw)
        if (state && typeof state === 'object') {
          this.isOpen = !!state.isOpen
          this.messages = Array.isArray(state.messages) ? state.messages : []
        }
      } catch (err) {
        console.warn('ChatWidget restoreState error', err)
      }
    },
  },
  watch: {
    draft(newVal) {
      const q = (newVal || '').trim()
      if (!q || !this.fuse) {
        this.suggestions = []
        return
      }
      const qNorm = this.normalize(q)
      const rs = this.fuse.search(qNorm).slice(0, 5)
      this.suggestions = rs.map((r) => ({ label: r.item.question_variants?.[0] || r.item.id }))
    },
    isOpen() {
      this.saveState()
    },
    messages: {
      deep: true,
      handler() {
        this.saveState()
      },
    },
  },
}
</script>

<style scoped>
.cs-chat {
  --cs-primary: #0ba360;
  --cs-primary2: #3cba92;
  --cs-dark: #0f172a;
  --cs-bg: #ffffff;
  --cs-surface: #f9fafb;
  --cs-border: #e5e7eb;

  position: fixed;
  right: 18px;
  bottom: 92px; /* đẩy lên trên một chút */
  z-index: 9999;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    'Apple Color Emoji',
    'Segoe UI Emoji';
}
.cs-toggle {
  background: linear-gradient(135deg, var(--cs-primary), var(--cs-primary2));
  color: #fff;
  border: 1px solid rgba(11, 163, 96, 0.4);
  border-radius: 999px;
  padding: 14px 20px;
  min-height: 48px;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 12px 28px rgba(11, 163, 96, 0.28);
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.2px;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}
.cs-toggle:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow: 0 16px 32px rgba(11, 163, 96, 0.34);
}
.cs-toggle:active {
  transform: translateY(0);
}
.cs-panel {
  width: 360px;
  height: 540px;
  background: var(--cs-bg);
  border-radius: 18px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.2),
    0 2px 0 rgba(11, 163, 96, 0.04) inset;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  bottom: 64px; /* tăng khoảng cách theo kích thước nút */
  border: 1px solid rgba(11, 163, 96, 0.08);
  backdrop-filter: saturate(120%) blur(4px);
}
.cs-header {
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--cs-primary), var(--cs-primary2));
  color: #fff;
}
.cs-title {
  font-weight: 800;
}
.cs-sub {
  opacity: 0.9;
}
.cs-body {
  flex: 1;
  overflow-y: auto;
  background: var(--cs-surface);
  padding: 12px;
}
.cs-msg {
  display: flex;
  width: 100%;
  margin: 10px 0;
}
.cs-msg.bot {
  flex-direction: column;
  align-items: flex-start;
}
.cs-msg.user {
  justify-content: flex-end;
}
.cs-bubble {
  max-width: 82%;
  padding: 10px 12px;
  border-radius: 14px;
  line-height: 1.45;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.cs-msg.user .cs-bubble {
  background: linear-gradient(135deg, var(--cs-primary), var(--cs-primary2));
  color: #fff;
  border-bottom-right-radius: 4px;
}
.cs-msg.bot .cs-bubble {
  background: #fff;
  color: var(--cs-dark);
  border: 1px solid rgba(11, 163, 96, 0.09);
  border-left: 3px solid var(--cs-primary);
  border-bottom-left-radius: 4px;
}
.cs-meta {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.6;
}
.cs-related {
  width: 100%;
  margin: 8px 0 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.cs-related-title {
  width: 100%;
  font-size: 12px;
  opacity: 0.7;
}
.cs-chip {
  border: 1px solid rgba(11, 163, 96, 0.2);
  background: #fff;
  color: var(--cs-primary);
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}
.cs-chip:hover {
  background: rgba(11, 163, 96, 0.06);
  border-color: rgba(11, 163, 96, 0.35);
}
.cs-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid var(--cs-border);
  background: #fff;
}
.cs-input input {
  flex: 1;
  border-radius: 999px;
  border: 1px solid var(--cs-border);
  padding: 10px 12px;
  font-size: 14px;
  transition: all 0.15s ease;
}
.cs-input input:focus {
  outline: none;
  border-color: rgba(11, 163, 96, 0.5);
  box-shadow: 0 0 0 3px rgba(11, 163, 96, 0.15);
}
.cs-input button {
  border: 0;
  background: linear-gradient(135deg, var(--cs-primary), var(--cs-primary2));
  color: #fff;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}
.cs-input button:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow: 0 8px 18px rgba(11, 163, 96, 0.28);
}
.cs-suggest {
  list-style: none;
  margin: 0;
  padding: 6px 10px 10px;
  border-top: 1px dashed rgba(11, 163, 96, 0.3);
  background: #fff;
}
.cs-suggest li {
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 10px;
  transition:
    background 0.15s ease,
    transform 0.05s ease;
}
.cs-suggest li:hover {
  background: rgba(11, 163, 96, 0.08);
}

/* Mobile tweaks */
@media (max-width: 480px) {
  .cs-panel {
    width: calc(100vw - 24px);
    right: 12px;
  }
}
</style>
