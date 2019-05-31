import * as cheerio from 'cheerio'
import Axios from 'axios'
import * as cp from 'child_process'
import { cpus } from 'os'
import { JSDOM } from 'jsdom'
import { EventEmitter } from 'events'

let urls = [
  'https://pl.wikipedia.org/wiki/Stefan_Amsterdamski',
  'https://pl.wikipedia.org/wiki/Stanis%C5%82aw_Bara%C5%84czak',
  'https://pl.wikipedia.org/wiki/W%C5%82adys%C5%82aw_Bartoszewski',
  'https://pl.wikipedia.org/wiki/W%C5%82adys%C5%82aw_Bie%C5%84kowski',
  'https://pl.wikipedia.org/wiki/Jacek_Boche%C5%84ski',
  'https://pl.wikipedia.org/wiki/Marian_Brandys',
  'https://pl.wikipedia.org/wiki/Alina_Brodzka-Wald',
  'https://pl.wikipedia.org/wiki/Tomasz_Burek',
  'https://pl.wikipedia.org/wiki/Andrzej_Celi%C5%84ski',
  'https://pl.wikipedia.org/wiki/Miros%C5%82awa_Chamc%C3%B3wna',
  'https://pl.wikipedia.org/wiki/Bohdan_Cywi%C5%84ski',
  'https://pl.wikipedia.org/wiki/Izydora_D%C4%85mbska',
  'https://pl.wikipedia.org/wiki/Roman_Duda',
  'https://pl.wikipedia.org/wiki/Kornel_Filipowicz',
  'https://pl.wikipedia.org/wiki/Wac%C5%82aw_Gajewski',
  'https://pl.wikipedia.org/wiki/Boles%C5%82aw_Gleichgewicht',
  'https://pl.wikipedia.org/wiki/Micha%C5%82_G%C5%82owi%C5%84ski',
  'https://pl.wikipedia.org/wiki/Antoni_Go%C5%82ubiew',
  'https://pl.wikipedia.org/wiki/Joanna_Guze',
  'https://pl.wikipedia.org/wiki/Stanis%C5%82aw_Hartman',
  'https://pl.wikipedia.org/wiki/Maria_Janion',
  'https://pl.wikipedia.org/wiki/Aldona_Jaw%C5%82owska',
  'https://pl.wikipedia.org/wiki/Jerzy_Jedlicki',
  'https://pl.wikipedia.org/wiki/Jakub_Karpi%C5%84ski',
  'https://pl.wikipedia.org/wiki/Adam_Kersten',
  'https://pl.wikipedia.org/wiki/Jan_Kielanowski',
  'https://pl.wikipedia.org/wiki/Andrzej_Kijowski_(krytyk)',
  'https://pl.wikipedia.org/wiki/Tadeusz_Kowalik',
  'https://pl.wikipedia.org/wiki/Waldemar_Kuczy%C5%84ski',
  'https://pl.wikipedia.org/wiki/W%C5%82adys%C5%82aw_Kunicki-Goldfinger',
  'https://pl.wikipedia.org/wiki/Edward_Lipi%C5%84ski',
  'https://pl.wikipedia.org/wiki/Jan_J%C3%B3zef_Lipski',
  'https://pl.wikipedia.org/wiki/Hanna_Malewska',
  'https://pl.wikipedia.org/wiki/Marian_Ma%C5%82owist',
  'https://pl.wikipedia.org/wiki/Tadeusz_Mazowiecki',
  'https://pl.wikipedia.org/wiki/Adam_Michnik',
  'https://pl.wikipedia.org/wiki/Halina_Miko%C5%82ajska',
  'https://pl.wikipedia.org/wiki/Irena_Nowak',
  'https://pl.wikipedia.org/wiki/Seweryn_Pollak',
  'https://pl.wikipedia.org/wiki/Irena_S%C5%82awi%C5%84ska',
  'https://pl.wikipedia.org/wiki/Adam_Stanowski',
  'https://pl.wikipedia.org/wiki/Jan_J%C3%B3zef_Szczepa%C5%84ski',
  'https://pl.wikipedia.org/wiki/Zdzis%C5%82aw_Szpakowski',
  'https://pl.wikipedia.org/wiki/Wis%C5%82awa_Szymborska',
  'https://pl.wikipedia.org/wiki/Marek_Tabin',
  'https://pl.wikipedia.org/wiki/Karol_Tarnowski',
  'https://pl.wikipedia.org/wiki/Andrzej_Tyszka',
  'https://pl.wikipedia.org/wiki/Henryk_Wereszycki',
  'https://pl.wikipedia.org/wiki/Andrzej_Werner_(krytyk)',
  'https://pl.wikipedia.org/wiki/Krzysztof_Wolicki',
  'https://pl.wikipedia.org/wiki/Jacek_Wo%C5%BAniakowski',
  'https://pl.wikipedia.org/wiki/Adam_Zagajewski',
  'https://pl.wikipedia.org/wiki/Czes%C5%82aw_Zgorzelski',
  'https://pl.wikipedia.org/wiki/Tadeusz_Zipser',
]

class App<Input, Out> extends EventEmitter {
  data: Out[] = []
  workers: number = 0

  constructor(
    public max: number,
    public workerPath: string,
    public input: Input[]
  ) {
    super()
    this.initWorkers()
  }

  consume() {
    console.clear()
    console.log(`${urls.length} left`)
    return urls.pop()
  }

  end() {
    return urls.length === 0
  }

  initWorkers() {
    for (let i = 0; i < this.max; i++) {
      const w = cp.fork(this.workerPath)
      this.workers++
      w.on('message', this.initOnMessage(w))
      w.send(this.consume())
    }
  }

  initOnMessage(w: cp.ChildProcess) {
    return (data: Out) => {
      this.data.push(data)
      if (this.end()) {
        w.kill()
        this.workers--
        console.log(this.workers)
        if (this.workers === 0) this.emit('finish', this)
      } else {
        w.send(this.consume())
      }
    }
  }
}

async function main() {
  const app = new App<string, string>(4, './worker', urls.slice())
  app.on('finish', (self: App<string, string>) => {
    const res = self.data.filter(x => !!x).sort()
    console.log(res, res.length)
  })
}

main()
