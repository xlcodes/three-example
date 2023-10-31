import {defineStore} from "pinia";
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
import store from "@/store";

/**
 * 创建全局唯一的 GUI 对象
 */
export const useGUIStore = defineStore('lil-gui', {
  state() {
    return {
      gui: undefined
    }
  },
  getters: {
    GUI: (state) => {
      return state.gui
    }
  },
  actions: {
    createGUI(option) {
      this.destroyGUI()
      this.gui = new GUI(option)
    },
    removeGUIElement() {
      const guiEl = document.getElementsByClassName('lil-gui')
      for (let i = 0; i < guiEl.length; i++) {
        guiEl[i].remove()
      }
    },
    destroyGUI() {
      if (this.gui) {
        this.gui.destroy()
        this.gui = undefined
        // 手动清理页面节点
        this.removeGUIElement()
      }
    }
  }
})

export const getGUIStore = () => {
  return useGUIStore(store)
}
