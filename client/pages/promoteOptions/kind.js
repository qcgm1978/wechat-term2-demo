export default {
  data: {
    tabs: [true,false],

  },
  methods: {
    toggleKind(e) {
      this.setData({
        tabs: this.data.tabs.map((item, index) => index === e.target.dataset.index)
      })
    }
  },
}