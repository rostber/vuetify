// Styles
import '../../stylus/components/_autocompletes.styl'

// Extensions
import VSelect from '../VSelect/VSelect'
import VAutocomplete from '../VAutocomplete/VAutocomplete'

// Utils
import { keyCodes } from '../../util/helpers'

export default {
  name: 'v-combobox',

  extends: VAutocomplete,

  computed: {
    hasSlot () {
      return VSelect.computed.hasSlot.call(this) || this.multiple
    },
    isAnyValueAllowed () {
      return true
    },
    menuCanShow () {
      if (!this.isFocused) return false

      return (this.displayedItemsCount > 0) ||
        (!!this.$slots['no-data'] && !this.hideNoData)
    }
  },

  methods: {
    onFilteredItemsChanged () {
      // nop
    },
    onInternalSearchChanged (val) {
      if (
        val &&
        this.multiple &&
        this.delimiters
      ) {
        const delimiter = this.delimiters.find(d => val.endsWith(d))
        if (delimiter == null) return

        this.internalSearch = val.slice(0, val.length - delimiter.length)
        this.updateTags()
      }

      this.updateMenuDimensions()
    },
    genChipSelection (item, index) {
      const chip = VSelect.methods.genChipSelection.call(this, item, index)

      // Allow user to update an existing value
      if (this.multiple) {
        chip.componentOptions.listeners.dblclick = () => {
          this.editingIndex = index
          this.internalSearch = this.getText(item)
          this.selectedIndex = -1
        }
      }

      return chip
    },
    onKeyDown (e) {
      const keyCode = e.keyCode

      VSelect.methods.onKeyDown.call(this, e)

      // If user is at selection index of 0
      // create a new tag
      if (this.multiple &&
        keyCode === keyCodes.left &&
        this.$refs.input.selectionStart === 0
      ) {
        this.updateSelf()
      }

      // The ordering is important here
      // allows new value to be updated
      // and then moves the index to the
      // proper location
      this.changeSelectedIndex(keyCode)
    },
    onTabDown (e) {
      // When adding tags, if searching and
      // there is not a filtered options,
      // add the value to the tags list
      if (this.multiple &&
        this.internalSearch &&
        this.getMenuIndex() === -1
      ) {
        e.preventDefault()
        e.stopPropagation()

        return this.updateTags()
      }

      VAutocomplete.methods.onTabDown.call(this, e)
    },
    setSelectedItems () {
      if (this.internalValue == null ||
        this.internalValue === ''
      ) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.multiple ? this.internalValue : [this.internalValue]
      }
    },
    updateSelf () {
      this.multiple ? this.updateTags() : this.updateCombobox()
    },
    updateCombobox () {
      // When using chips and search is dirty
      // avoid updating input
      if (this.hasChips && !this.searchIsDirty) return

      // The internal search is not matching
      // the initial value, update the input
      if (this.internalSearch !== this.internalValue) this.setValue()

      // Reset search if using chips
      // to avoid a double input
      if (this.hasChips) this.internalSearch = undefined
    },
    updateTags () {
      const menuIndex = this.getMenuIndex()

      // If the user is not searching
      // and no menu item is selected
      // do nothing
      if (menuIndex < 0 &&
        !this.searchIsDirty
      ) return

      const index = this.selectedItems.indexOf(this.internalSearch)
      // If it already exists, do nothing
      // this might need to change to bring
      // the duplicated item to the last entered
      if (index > -1) {
        this.internalValue.splice(index, 1)
      }

      // If menu index is greater than 1
      // the selection is handled elsewhere
      // TODO: find out where
      if (menuIndex > -1) return (this.internalSearch = null)

      this.selectItem(this.internalSearch)
      this.internalSearch = null
    }
  }
}
