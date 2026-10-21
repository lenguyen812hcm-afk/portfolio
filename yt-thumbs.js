/* ============================================================
   YT THUMBS — thay ảnh nền chờ (SVG) của card bằng thumbnail
   thật lấy từ video YouTube (data-yt).
   - Ưu tiên maxresdefault (1280x720), không có thì hqdefault.
   - Card nhiều phiên bản: ảnh đổi theo tab đang chọn.
   - Card không có ID YouTube: giữ nguyên ảnh SVG cũ.
   Drop-in: chỉ cần <script src="yt-thumbs.js" defer></script>
   ============================================================ */
(function () {
  const CSS = `
  .card-media .yt-thumb{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;
    opacity:0;transform:scale(1.02);transition:opacity .5s,transform .7s cubic-bezier(.22,1,.36,1);pointer-events:none;
    filter:saturate(1.05) contrast(1.03)}
  .card-media .yt-thumb.ready{opacity:1}
  .card-media.has-yt-thumb::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
    background:linear-gradient(180deg,rgba(5,5,9,.15) 0%,rgba(5,5,9,0) 35%,rgba(5,5,9,.55) 100%)}
  .card-media.has-yt-thumb .thumb-art{opacity:0}
  .card-media:hover .yt-thumb.ready{transform:scale(1.07)}
  .card-media.playing .yt-thumb,.card-media.playing::after{opacity:0!important}`;
  const st = document.createElement('style');
  st.id = 'yt-thumbs-css';
  st.textContent = CSS;
  document.head.appendChild(st);

  const cache = {};
  function bestUrl(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    return new Promise(res => {
      const probe = new Image();
      probe.onload = () => {
        // YouTube trả ảnh xám 120x90 khi không có bản maxres
        const url = probe.naturalWidth > 120
          ? probe.src
          : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        res(cache[id] = url);
      };
      probe.onerror = () => res(cache[id] = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
      probe.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    });
  }

  function pickId(media) {
    const vids = [...media.querySelectorAll('video')];
    const active = media.querySelector('video.active-video') || vids[0];
    if (active && active.dataset.yt) return active.dataset.yt.trim();
    const any = vids.find(v => v.dataset.yt && v.dataset.yt.trim());
    return any ? any.dataset.yt.trim() : '';
  }

  function update(media) {
    const id = pickId(media);
    if (!id || media.dataset.ytThumb === id) return;
    media.dataset.ytThumb = id;
    let img = media.querySelector('img.yt-thumb');
    if (!img) {
      img = document.createElement('img');
      img.className = 'yt-thumb';
      img.alt = '';
      img.decoding = 'async';
      img.loading = 'lazy';
      const art = media.querySelector('.thumb-art');
      art ? art.after(img) : media.prepend(img);
    }
    img.classList.remove('ready');
    bestUrl(id).then(url => {
      if (media.dataset.ytThumb !== id) return;
      img.onload = () => { img.classList.add('ready'); media.classList.add('has-yt-thumb'); };
      img.src = url;
    });
  }

  function init() {
    const medias = document.querySelectorAll('.card-media');
    // Tải lười: chỉ lấy ảnh khi card gần vào màn hình
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver(es => es.forEach(e => {
          if (e.isIntersecting) { update(e.target); io.unobserve(e.target); }
        }), { rootMargin: '400px 0px' })
      : null;
    medias.forEach(m => {
      io ? io.observe(m) : update(m);
      // Đổi tab phiên bản → đổi thumbnail
      new MutationObserver(() => { if (m.dataset.ytThumb !== undefined) update(m); })
        .observe(m, { subtree: true, attributes: true, attributeFilter: ['class'] });
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
