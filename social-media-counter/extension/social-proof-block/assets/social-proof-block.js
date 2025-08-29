(function () {
  /* global Shopify */
  const scriptData = document.currentScript?.dataset || {};
  const rootId = scriptData.rootId;
  const root = rootId
    ? document.querySelector('#spb-root[data-root-id="' + rootId + '"]')
    : document.getElementById('spb-root');
  if (!root) return;
  const d = root.dataset;
  const showGt = d.showGtPrefix === 'true';

  console.log('SPB dataset:', d);

  const metrics = [];
  const idPrefix = rootId ? rootId + '-' : '';
  const shopDomain =
    scriptData.shopDomain || (window.Shopify && Shopify.shop ? Shopify.shop : '');
  console.log('SPB shopDomain:', shopDomain);

  init();

  function init() {
    root.className = 'social-proof-block';

  if (
    d.borderRadiusTl ||
    d.borderRadiusTr ||
    d.borderRadiusBr ||
    d.borderRadiusBl
  ) {
    if (d.borderRadiusTl) root.style.borderTopLeftRadius = d.borderRadiusTl + 'px';
    if (d.borderRadiusTr) root.style.borderTopRightRadius = d.borderRadiusTr + 'px';
    if (d.borderRadiusBr) root.style.borderBottomRightRadius = d.borderRadiusBr + 'px';
    if (d.borderRadiusBl) root.style.borderBottomLeftRadius = d.borderRadiusBl + 'px';
  } else if (d.borderRadius) {
    root.style.borderRadius = d.borderRadius + 'px';
  }

  if (d.backgroundColor) {
    root.style.background = d.backgroundColor;
    if (d.useGradient === 'true') {
      root.style.background = `linear-gradient(90deg, ${d.backgroundColor}, ${shadeColor(
        d.backgroundColor,
        -25
      )})`;
    }
  }

  if (d.textColor) {
    root.style.color = d.textColor;
  }
  if (d.headlineColor) {
    root.style.setProperty('--headline-color', d.headlineColor);
  }

  const vars = {
    '--headline-size': d.headlineSize ? d.headlineSize + 'px' : null,
    '--subline-size': d.subtitleSize ? d.subtitleSize + 'px' : null,
    '--metric-value-size': d.metricFontSize ? d.metricFontSize + 'px' : null,
    '--metric-label-size': d.labelFontSize ? d.labelFontSize + 'px' : null,
    '--metric-icon-size': d.metricIconSize ? d.metricIconSize + 'px' : null,
    '--social-icon-size': d.socialIconSize ? d.socialIconSize + 'px' : null,
    '--ticker-font-size': d.tickerFontSize ? d.tickerFontSize + 'px' : null,
    '--ticker-height': d.tickerHeight ? d.tickerHeight + 'px' : null
  };
  Object.entries(vars).forEach(([k, v]) => {
    if (v) root.style.setProperty(k, v);
  });

  const icons = {
    spbf:
      '<path fill-rule="evenodd" d="M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-2 3.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/><path fill-rule="evenodd" d="M15.484 14.227a6.274 6.274 0 0 0-10.968 0l-.437.786a1.338 1.338 0 0 0 1.17 1.987h9.502a1.338 1.338 0 0 0 1.17-1.987l-.437-.786Zm-9.657.728a4.773 4.773 0 0 1 8.346 0l.302.545h-8.95l.302-.545Z"/>',
    spbl:
      '<path d="M8.469 5.785c-.966-1.047-2.505-1.047-3.47 0-.998 1.081-.998 2.857 0 3.939l5.001 5.42 5.002-5.42c.997-1.082.997-2.858 0-3.939-.966-1.047-2.505-1.047-3.47 0l-.98 1.062a.75.75 0 0 1-1.103 0l-.98-1.062Zm-4.573-1.017c1.56-1.69 4.115-1.69 5.675 0l.429.464.429-.464c1.56-1.69 4.115-1.69 5.675 0 1.528 1.656 1.528 4.317 0 5.973l-5.185 5.62a1.25 1.25 0 0 1-1.838 0l-5.185-5.62c-1.528-1.656-1.528-4.317 0-5.973Z"/>',
    spbv:
      '<path fill-rule="evenodd" d="M15.375 8.485c1.167.674 1.167 2.358 0 3.031l-7.5 4.33c-1.167.674-2.625-.168-2.625-1.515v-8.66c0-1.348 1.458-2.19 2.625-1.516l7.5 4.33Zm-.75 1.732a.25.25 0 0 0 0-.433l-7.5-4.33a.25.25 0 0 0-.375.217v8.66a.25.25 0 0 0 .375.216l7.5-4.33Z"/>',
    spbp:
      '<path d="M12.5 3a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0v-1.25a.75.75 0 0 1 .75-.75Z"/><path d="M16.03 5.03a.75.75 0 0 0-1.06-1.06l-1 1a.75.75 0 0 0 1.06 1.06l1-1Z"/><path d="M5.5 7c0-.69.56-1.25 1.25-1.25h3.25a.75.75 0 0 0 0-1.5h-3.25a2.75 2.75 0 0 0-2.75 2.75v7.25a2.75 2.75 0 0 0 2.75 2.75h6.5a2.75 2.75 0 0 0 2.75-2.75v-3.625a.75.75 0 0 0-1.5 0v3.625c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-7.25Z"/><path d="M7.25 12.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Z"/><path fill-rule="evenodd" d="M6.25 7.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-3Zm1.5.75v1.5h4.5v-1.5h-4.5Z"/><path d="M16.5 8.25a.75.75 0 0 0 0-1.5h-1.25a.75.75 0 0 0 0 1.5h1.25Z"/>',
    facebook:
      '<path d="m81.3942 66.8069 2.8527-18.2698h-17.8237v-11.8507c0-5.0051 2.4876-9.8755 10.4751-9.8755h8.1017v-15.5765s-7.3485-1.2344-14.4004-1.2344c-14.6743 0-24.2822 8.7533-24.2822 24.5991v13.938h-16.3174v18.2698h16.3174v44.1931h20.083v-44.1931z"/>',
    instagram:
      '<path d="M60 10c-13.606 0-15.296.067-20.609.289-5.336.267-8.96 1.089-12.139 2.334-3.29 1.29-6.092 3.002-8.848 5.78-2.779 2.757-4.513 5.558-5.78 8.848-1.245 3.179-2.068 6.803-2.334 12.139-.244 5.336-.289 7.025-.289 20.609s.067 15.296.289 20.609c.267 5.336 1.089 8.96 2.334 12.139 1.29 3.29 3.001 6.092 5.78 8.848 2.757 2.779 5.558 4.513 8.848 5.781 3.179 1.222 6.825 2.067 12.139 2.334 5.336.245 7.025.289 20.609.289s15.296-.067 20.609-.289c5.336-.267 8.96-1.112 12.139-2.334 3.29-1.29 6.092-3.002 8.848-5.781 2.779-2.757 4.513-5.558 5.781-8.848 1.222-3.179 2.067-6.825 2.334-12.139.245-5.336.289-7.025.289-20.609s-.067-15.296-.289-20.609c-.267-5.336-1.112-8.982-2.334-12.139-1.29-3.29-3.002-6.092-5.781-8.848-2.757-2.779-5.558-4.513-8.848-5.78-3.179-1.245-6.825-2.068-12.139-2.334C75.296 10.067 73.606 10 60 10zm0 9.004c13.362 0 14.94.067 20.231.289 4.869.222 7.515 1.045 9.271 1.734 2.357.912 3.98 1.979 5.758 3.735 1.734 1.734 2.823 3.402 3.735 5.758.689 1.756 1.512 4.402 1.734 9.271.223 5.269.289 6.87.289 20.231s-.066 14.94-.311 20.231c-.267 4.869-1.067 7.515-1.756 9.271-.956 2.357-2.001 3.98-3.757 5.758-1.756 1.734-3.446 2.824-5.758 3.735-1.734.689-4.424 1.512-9.315 1.734-5.314.223-6.87.289-20.254.289s-14.94-.066-20.254-.311c-4.869-.267-7.559-1.067-9.315-1.756-2.379-.956-4.002-2.001-5.758-3.757-1.756-1.756-2.89-3.446-3.735-5.758-.711-1.734-1.512-4.424-1.756-9.315-.178-5.247-.267-6.87-.267-20.187 0-13.317.089-14.94.267-20.254.267-4.891 1.067-7.559 1.756-9.315.867-2.379 1.979-4.002 3.735-5.758 1.756-1.756 3.402-2.89 5.758-3.757 1.734-.689 4.38-1.49 9.271-1.734C45.06 19.07 46.616 19.004 60 19.004zm0 15.34c-14.206 0-25.678 11.494-25.678 25.678 0 14.206 11.494 25.678 25.678 25.678 14.206 0 25.678-11.494 25.678-25.678 0-14.184-11.494-25.678-25.678-25.678zm0 42.352c-9.226 0-16.674-7.448-16.674-16.674 0-9.226 7.448-16.674 16.674-16.674s16.674 7.448 16.674 16.674c0 9.226-7.448 16.674-16.674 16.674zm32.726-43.375c0 3.335-2.712 6.003-6.003 6.003-3.335 0-6.003-2.69-6.003-6.003s2.712-6.003 6.003-6.003c3.29 0 6.003 2.69 6.003 6.003z"/>',
    pinterest:
      '<path d="m59.9889 10c-27.6161 0-49.9889 22.3828-49.9889 50.0111 0 21.2047 13.1749 39.2754 31.7707 46.5439-.4221-3.957-.8442-10.0247.1778-14.3367.9109-3.912 5.8653-24.85 5.8653-24.85s-1.4885-3.0007-1.4885-7.4239c0-6.9571 4.0213-12.1582 9.0424-12.1582 4.2657 0 6.3319 3.2007 6.3319 7.0238 0 4.2898-2.7327 10.7134-4.1546 16.6259-1.1997 4.9789 2.4883 9.0464 7.3983 9.0464 8.887 0 15.7077-9.3798 15.7077-22.8939 0-11.9583-8.6203-20.3379-20.8621-20.3379-14.219 0-22.5505 10.669-22.5505 21.7159 0 4.3121 1.6441 8.9131 3.7103 11.4026.3999.489.4665.9335.3332 1.4447-.3777 1.5782-1.2219 4.9789-1.3997 5.668-.2221.9335-.7109 1.1113-1.6662.689-6.2431-2.9117-10.1311-12.0471-10.1311-19.3599 0-15.7812 11.4419-30.2511 33.0149-30.2511 17.3294 0 30.8153 12.3583 30.8153 28.8731 0 17.226-10.8642 31.118-25.9275 31.118-5.0656 0-9.8201-2.645-11.4419-5.7568 0 0-2.5106 9.5354-3.1105 11.8915-1.133 4.3565-4.1768 9.7795-6.2208 13.0915 4.6878 1.445 9.6423 2.223 14.7967 2.223 27.5939 0 49.9889-22.3828 49.9889-50.0111-.022-27.6061-22.395-49.9889-50.0111-49.9889z"/>',
    tiktok:
      '<path d="m102.986 50.4581c-.831.0796-1.665.1211-2.5.1249-9.1551.001-17.6938-4.5378-22.7089-12.0716v41.1066c0 16.7794-13.8293 30.382-30.8885 30.382s-30.8886-13.6026-30.8886-30.382 13.8294-30.382 30.8886-30.382c.6449 0 1.2751.0569 1.9091.0964v14.9717c-.634-.0747-1.2571-.1889-1.9091-.1889-8.7067 0-15.7649 6.9425-15.7649 15.5064s7.0582 15.5061 15.7649 15.5061c8.7082 0 16.3988-6.7482 16.3988-15.3136l.1519-69.8141h14.5623c1.3732 12.8445 11.9028 22.8773 24.9984 23.8188v16.6393"/>',
    x:
      '<path style="transform: scale(0.8); transform-box: fill-box; transform-origin: center;" d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"/>',
    youtube:
      '<path style="transform: translateY(2px); transform-box: fill-box; transform-origin: center;" d="m88.2484 25h-56.4747c-12.023 0-21.7516 9.751-21.7737 21.7523v26.4734c0 12.0233 9.7507 21.7743 21.7737 21.7743h56.4747c12.0226 0 21.7516-9.751 21.7516-21.7743v-26.4734c0-12.0233-9.729-21.7523-21.7516-21.7523zm-13.854 36.3126-22.5237 12.3543c-.9706.5294-1.8531-.1765-1.8531-1.3016v-25.3262c0-1.1251.9045-1.8311 1.8972-1.2796l22.6561 12.994c.9927.5736.8383 2.0297-.1765 2.5591z"/>'
  };
  const data = window.SPB_DATA || {
    followers: 0,
    likes: 0,
    views: 0,
    posts: 0,
    platforms: []
  };
  console.log('\ud83d\udce6 Social Proof Daten (Meta Field):', data);

  if (d.showPosts === 'true') {
    metrics.push({
      label: 'Posts',
      icon: 'spbp',
      id: idPrefix + 'spbp',
      value: data.posts,
      speed: 0
    });
  }
  if (d.showFollowers === 'true') {
    const perMinute = Math.max(parseFloat(d.speedFollowers || '3'), 0);
    const speed = perMinute > 0 ? 60000 / perMinute : 0;
    metrics.push({
      label: 'Followers',
      icon: 'spbf',
      id: idPrefix + 'spbf',
      value: data.followers,
      speed
    });
  }
  if (d.showLikes === 'true') {
    const perMinute = Math.max(parseFloat(d.speedLikes || '2'), 0);
    const speed = perMinute > 0 ? 60000 / perMinute : 0;
    metrics.push({
      label: 'Likes',
      icon: 'spbl',
      id: idPrefix + 'spbl',
      value: data.likes,
      speed
    });
  }
  if (d.showViews === 'true') {
    const perMinute = Math.max(parseFloat(d.speedViews || '2'), 0);
    const speed = perMinute > 0 ? 60000 / perMinute : 0;
    metrics.push({
      label: 'Views',
      icon: 'spbv',
      id: idPrefix + 'spbv',
      value: data.views,
      speed
    });
  }

  render(data);

  function render(data) {
    const html = metrics
      .map((m) => metric(m.label, m.icon, m.id, d.iconColor, m.value))
      .join('');

    const linksHtml = data.platforms
      .map((p) => {
        const viewBox = p.id === 'x' ? '0 0 300 300' : '0 0 120 120';
        return (
          '<a href="' +
          p.profileUrl +
          '" target="_blank"><svg fill="' +
          d.iconColor +
          '" viewBox="' +
          viewBox +
          '">' +
          icons[p.id] +
          '</svg></a>'
        );
      })
      .join('');

    root.innerHTML =
      '<h3>' +
      d.headlineText +
      '</h3>' +
      '<div class="metrics">' +
      html +
      '</div>' +
      '<p>' +
      d.sublineText +
      '</p>' +
      '<div class="links">' +
      linksHtml +
      '</div>';

    if (d.enableTicker === 'true') {
      const entriesHtml = data.platforms
        .map((p) => {
          const parts = [];
          if (p.posts > 0) parts.push(p.posts.toLocaleString() + ' Posts');
          if (p.followers > 0)
            parts.push(p.followers.toLocaleString() + ' Followers');
          if (p.likes > 0) parts.push(p.likes.toLocaleString() + ' Likes');
          if (p.views > 0) parts.push(p.views.toLocaleString() + ' Views');
          if (!parts.length) return '';
          const iconPath = icons[p.id];
          const viewBox = p.id === 'x' ? '0 0 300 300' : '0 0 120 120';
          const icon = iconPath
            ?
              '<span class="spb-ticker-icon"><svg viewBox="' +
              viewBox +
              '">' +
              iconPath +
              '</svg></span>'
            : '';
          const metrics = parts
            .map((t) => '<span>' + t + '</span>')
            .join('');
          return (
            '<span class="spb-ticker-item">' +
            icon +
            '<span class="spb-ticker-metrics">' +
            metrics +
            '</span></span>'
          );
        })
        .filter(Boolean)
        .join('');
      if (entriesHtml) {
        const ticker = document.createElement('div');
        ticker.className = 'spb-ticker';
        ticker.innerHTML =
          '<div class="spb-ticker-inner">' + entriesHtml + '</div>';
        root.appendChild(ticker);
      }
    }

  metrics.forEach((m) => {
      startCounter(m.id, m.value, m.speed);
    });

  }

  function metric(label, iconKey, id, color, value) {
    const svg =
      '<svg fill="' + color + '" viewBox="0 0 20 20">' +
      icons[iconKey] +
      '</svg>';
    const chars = (
      showGt ? ['>', ' '] : []
    ).concat(String((value || 0).toLocaleString()).split(''));
    const digitsHtml = chars
      .map((ch) => '<span class="digit"><span>' + ch + '</span></span>')
      .join('');
    return (
      '<div class="metric">' +
      '<div class="metric-icon">' +
      svg +
      '</div>' +
      '<div class="metric-value" data-has-gt-prefix="' +
      showGt +
      '" id="' +
      id +
      '">' +
      digitsHtml +
      '</div>' +
      '<div class="metric-label">' +
      label +
      '</div></div>'
    );
  }

  function startCounter(id, start, interval) {
    const el = root.querySelector('#' + id);
    if (!el) return;
    let current = parseInt(start, 10) || 0;
    updateValue(el, current);
    if (!interval || interval <= 0) return;
    function tick() {
      current += 1;
      updateValue(el, current);
      const delay = interval * (0.5 + Math.random());
      setTimeout(tick, delay);
    }
    const delay = interval * (0.5 + Math.random());
    setTimeout(tick, delay);
  }

  function updateValue(container, value) {
    const hasPrefix = container.dataset.hasGtPrefix === 'true';
    const prefixCount = hasPrefix ? 2 : 0;
    const chars = (hasPrefix ? ['>', ' '] : [])
      .concat(String(value.toLocaleString()).split(''));
    const wrappers = Array.from(container.querySelectorAll('.digit'));
    while (wrappers.length < chars.length) {
      const wrap = document.createElement('span');
      wrap.className = 'digit';
      wrap.innerHTML = '<span></span>';
      container.insertBefore(wrap, wrappers[prefixCount] || null);
      wrappers.splice(prefixCount, 0, wrap);
    }
    while (wrappers.length > chars.length) {
      wrappers[prefixCount].remove();
      wrappers.splice(prefixCount, 1);
    }
    wrappers.forEach((wrap, i) => {
      const spans = wrap.querySelectorAll('span');
      const inner = spans[spans.length - 1];
      const ch = chars[i];
      if (inner.textContent !== ch) {
        spans.forEach((s, idx) => {
          if (idx < spans.length - 1) s.remove();
        });
        if (document.visibilityState === 'hidden') {
          wrap.innerHTML = '';
          const span = document.createElement('span');
          span.textContent = ch;
          wrap.appendChild(span);
        } else {
          const newSpan = document.createElement('span');
          newSpan.textContent = ch;
          newSpan.style.transform = 'translateY(-100%)';
          newSpan.style.opacity = '0';
          wrap.appendChild(newSpan);
          requestAnimationFrame(() => {
            newSpan.style.transform = 'translateY(0)';
            newSpan.style.opacity = '1';
            inner.style.transform = 'translateY(100%)';
            inner.style.opacity = '0';
            setTimeout(() => inner.remove(), 400);
          });
        }
      }
    });
  }

  }

  function shadeColor(col, percent) {
    let num = parseInt(col.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = (num >> 16) + amt;
    const g = ((num >> 8) & 0x00ff) + amt;
    const b = (num & 0x0000ff) + amt;
    return (
      '#' +
      (0x1000000 +
        (r < 255 ? (r < 0 ? 0 : r) : 255) * 0x10000 +
        (g < 255 ? (g < 0 ? 0 : g) : 255) * 0x100 +
        (b < 255 ? (b < 0 ? 0 : b) : 255))
        .toString(16)
        .slice(1)
    );
  }

})();
