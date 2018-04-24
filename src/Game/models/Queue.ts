// task queue/buffer for user input while game is running
// modified from https://basarat.gitbooks.io/algorithms/content/docs/datastructures/queue.html
export class Queue<T> {
  _store: T[] = []
  enQueue (queueItem: T): void {
    // stick it in the queue
    this._store.push(queueItem)
  }
  deQueue (): T | undefined {
    // take whatever is at count and pullit out
    return this._store.shift()
  }
  isEmpty (): boolean {
    if (this._store.length > 0) {
      return false
    } else {
      return true
    }
  }
}
