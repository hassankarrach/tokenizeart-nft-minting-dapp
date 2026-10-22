const columns = [[1,4,7,10],[2,5,8],[3,6,9]];
const descriptions = ["Campus tiger", "Lounging shark with bottles and a glass", "Ginger cat in green beanie", "Horse on a pink scooter", "Frog in formal clothing", "Web-patterned dinosaur chasing a superhero", "Rabbit performing a side kick", "Older character in a toy truck", "Football character holding a baguette", "Blue-clothed martial artist"];
const gallery = document.querySelector('#gallery-columns');
columns.forEach((items,index)=>{
  const column=document.createElement('div');column.className='column';
  const track=document.createElement('div');track.className='track';track.style.setProperty('--duration',`${46+index*7}s`);
  for(let repeat=0;repeat<2;repeat++){
    const set=document.createElement('div');set.className='set';
    items.forEach(id=>{const card=document.createElement('figure');card.className=`art ${id===6?'duo':id===4?'food':''}`;
      const img=document.createElement('img');img.src=`assets/character-${String(id).padStart(2,'0')}-branded.png`;img.alt=descriptions[id-1];img.decoding='async';card.append(img);set.append(card);
    });track.append(set);
  }column.append(track);gallery.append(column);
});
