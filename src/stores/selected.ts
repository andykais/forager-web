import { writable } from 'svelte/store'
import type { MediaReferenceTR } from 'forager/src/models/media_reference'

class SelectedMedia {

  media_references: MediaReferenceTR[] = []
  select_range_on = false
  selected_set = new Set<number>()
  last_selected = {
    id: null  as number | null,
    index: null as number | null
  }

  public get ui_all_ids_selected() {
    return this.selected_set
  }
  public get ui_current_id_selected() {
    return this.last_selected.id
  }

  public set_media_references(media_references: MediaReferenceTR[]) {
    this.media_references = media_references
  }

  public select_range(on: boolean) {
    this.select_range_on = on
  }

  private select(media_reference_id: number, media_index: number) {
    if (this.select_range_on) {
      let start_index = this.last_selected.index
      let stop_index = media_index
      if (this.last_selected.index > media_index) {
        [start_index, stop_index] = [stop_index, start_index]
      }
      for (let index = start_index; index < stop_index; index++) {
        this.selected_set.add(this.media_references[index].id)
      }
    }
    this.selected_set.add(media_reference_id)
    this.last_selected.id = media_reference_id
    this.last_selected.index = media_index
    selected.set(this.selected_set)
    current_media_reference_id.set(media_reference_id)
  }

  private deselect(media_reference_id: number, media_index: number) {
    this.selected_set.delete(media_reference_id)
    selected.set(this.selected_set)
  }

  public toggle(media_reference_id: number, media_index: number) {
    if (this.selected_set.has(media_reference_id)) this.deselect(media_reference_id, media_index)
    else this.select(media_reference_id, media_index)
  }
}

const selected_media = new SelectedMedia()
const selected = writable(selected_media.ui_all_ids_selected)
const current_media_reference_id = writable(selected_media.ui_current_id_selected)

export { selected_media, selected }
