export function createMusicSong(index) {
  return {
    id: index,
    title: '我走后' + index,
    imageUrl: 'https://www.carsmp3.com/data/attachment/forum/201909/19/091020q5kgre20fidreqyt.jpg',
    audioUrl: '',
    videoUrl: '',
    desc: 'Metal, symphony, film soundtrack, grand, majesticMetal, dtrack, grand, majestic',
    date: '2024年04月30日 14:02:57',
    lyric: `<div class="_words_17xen_66"><div>大江东去，浪淘尽，千古风流人物。
      </div><div>故垒西边，人道是，三国周郎赤壁。
      </div><div>乱石穿空，惊涛拍岸，卷起千堆雪。
      </div><div>江山如画，一时多少豪杰。
      </div><div>
      </div><div>遥想公瑾当年，小乔初嫁了，雄姿英发。
      </div><div>羽扇纶巾，谈笑间，樯橹灰飞烟灭。
      </div><div>故国神游，多情应笑我，早生华发。
      </div><div>人生如梦，一尊还酹江月。</div></div>`
  }
}

export function createMusicSongList(count) {
  return Array.from({ length: count }, (_, index) => createMusicSong(index))
}
