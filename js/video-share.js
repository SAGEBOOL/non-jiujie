/**
 * video-share.js — 全站视频控件增强
 *
 * 1. 给所有 <video controls> 自动加 controlsList="nodownload"（隐藏下载选项）
 * 2. 在每个带控件的视频右下角叠加一个"分享"浮动按钮
 *    - 调用 Web Share API（移动端原生分享面板）
 *    - 桌面端降级为复制当前页面 URL 到剪贴板
 *    - 品牌配色：青 #00F5FF / 红 #FF2D20
 */
(function () {
  'use strict';

  /* ── 1. 禁用下载 ─────────────────────────── */
  document.querySelectorAll('video[controls]').forEach(function (v) {
    v.setAttribute('controlsList', 'nodownload');
  });

  /* ── 2. 分享按钮 ─────────────────────────── */
  var videos = document.querySelectorAll('video[controls]');
  if (!videos.length) return;

  var style = document.createElement('style');
  style.textContent = [
    '.video-share-btn {',
    '  position: absolute; right: 12px; bottom: 48px;',   /* 控件栏上方 */
    '  z-index: 10;',
    '  display: none; align-items: center; gap: 6px;',
    '  padding: 6px 14px;',
    '  border: 1px solid rgba(0,245,255,.35);',
    '  border-radius: 8px;',
    '  background: rgba(0,0,0,.72);',
    '  color: #00F5FF;',
    '  font-family: -apple-system,BlinkMacSystemFont,"Noto Sans SC",sans-serif;',
    '  font-size: 12px; letter-spacing: .5px;',
    '  cursor: pointer;',
    '  backdrop-filter: blur(8px);',
    '  -webkit-backdrop-filter: blur(8px);',
    '  transition: opacity .25s, border-color .25s, background .25s, transform .15s;',
    '  opacity: 0; pointer-events: none;',
    '}',
    '.video-share-btn.visible { opacity: 1; pointer-events: auto; }',
    '.video-share-btn:hover {',
    '  background: rgba(0,245,255,.12);',
    '  border-color: rgba(255,45,32,.55); color: #fff;',
    '  transform: translateY(-1px);',
    '}',
    '.video-share-btn svg { width: 15px; height: 15px; fill: currentColor; flex-shrink: 0; }',
    '.video-share-btn .share-toast {',
    '  position: absolute; top: -32px; left: 50%; transform: translateX(-50%);',
    '  padding: 4px 10px; border-radius: 6px;',
    '  background: rgba(255,45,32,.85); color: #fff;',
    '  font-size: 11px; white-space: nowrap;',
    '  opacity: 0; transition: opacity .3s; pointer-events: none;',
    '}',
    '.video-share-btn .share-toast.show { opacity: 1; }'
  ].join('\n');
  document.head.appendChild(style);

  var svgIcon =
    '<svg viewBox="0 0 24 24"><path d="M18 16c-.8 0-1.4.3-2 .8l-6.1-3.5c.1-.2.1-.5.1-.8s0-.5-.1-.8L16 8.3c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .3 0 .5.1.8L9.1 9.8C8.5 9.3 7.8 9 7 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.4-.3 2-.8l6.1 3.5c-.1.2-.1.5-.1.8 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3z"/></svg>';

  videos.forEach(function (video) {
    // 确保 video 有定位上下文
    var wrapper = video.parentElement;
    var cs = window.getComputedStyle(wrapper);
    if (cs.position === 'static') wrapper.style.position = 'relative';

    var btn = document.createElement('button');
    btn.className = 'video-share-btn';
    btn.type = 'button';
    btn.innerHTML = svgIcon + '<span>分享</span><span class="share-toast">链接已复制</span>';
    btn.setAttribute('aria-label', '分享此视频');

    // hover 视频时显示按钮
    wrapper.addEventListener('mouseenter', function () { btn.classList.add('visible'); });
    wrapper.addEventListener('mouseleave', function () { btn.classList.remove('visible'); });
    // 移动端：点击视频区域切换显示
    wrapper.addEventListener('touchstart', function () {
      btn.classList.add('visible');
      clearTimeout(btn._hideTm);
      btn._hideTm = setTimeout(function () { btn.classList.remove('visible'); }, 3000);
    }, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var url = location.href;
      var title = document.title || 'NON-九界';
      var text = '来自 NON-九界 的精彩内容：' + title;

      if (navigator.share) {
        navigator.share({ title: title, text: text, url: url }).catch(function () {});
      } else {
        // 降级：复制 URL 到剪贴板
        navigator.clipboard.writeText(url).then(function () {
          var toast = btn.querySelector('.share-toast');
          toast.classList.add('show');
          setTimeout(function () { toast.classList.remove('show'); }, 1600);
        }).catch(function () {});
      }
    });

    wrapper.appendChild(btn);
  });
})();
