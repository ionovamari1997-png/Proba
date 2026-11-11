
  // ===== COVER DUET BACKGROUND VIDEO =====
  (function(){
    var duetBg = document.querySelector('.cover-duet-spotlight-video');
    if(!duetBg){ return; }
    duetBg.muted = true;
    duetBg.defaultMuted = true;
    function playDuetBg(){
      var attempt = duetBg.play();
      if(attempt && typeof attempt.catch === 'function'){ attempt.catch(function(){}); }
    }
    if(duetBg.readyState >= 2){ playDuetBg(); }
    else{ duetBg.addEventListener('canplay', playDuetBg, {once:true}); }
  })();

  // ===== CORPORATE SECTION =====
  (function(){
    var source = document.getElementById('corporate');
    var details = document.getElementById('corporate-details');
    if(source && details){
      var sourceInner = source.querySelector('.acc-body-inner');
      if(sourceInner){
        details.classList.add('is-accordion-content');
        sourceInner.insertBefore(details, sourceInner.firstChild);
      }
    }
  })();

  // ===== VIDEO LINKS =====
  (function(){
    var videoSection = document.getElementById('video');
    if(!videoSection){ return; }
    Array.prototype.slice.call(document.querySelectorAll('a[href="#video"]')).forEach(function(link){
      link.addEventListener('click', function(event){
        event.preventDefault();
        var top = videoSection.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({top:top, behavior:'auto'});
        history.replaceState(null, '', '#video');
      });
    });
  })();

  // ===== VIDEO CAROUSEL =====
  (function(){
    var slides = Array.prototype.slice.call(document.querySelectorAll('.vslide'));
    var stage = document.getElementById('vStage');
    var counter = document.getElementById('vCounter');
    var prevBtn = document.getElementById('vPrev');
    var nextBtn = document.getElementById('vNext');
    var videos = Array.prototype.slice.call(document.querySelectorAll('.vslide video'));
    var current = 0;

    function applyOrientation(){
      var orientation = slides[current].getAttribute('data-orientation');
      stage.classList.toggle('is-landscape', orientation === 'landscape');
    }

    function goTo(index){
      videos.forEach(function(video){
        video.pause();
        video.currentTime = 0;
        video.muted = false;
      });
      slides[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      applyOrientation();
      counter.textContent = (current + 1) + ' / ' + slides.length;
    }

    if(prevBtn && nextBtn && slides.length){
      prevBtn.addEventListener('click', function(){ goTo(current - 1); });
      nextBtn.addEventListener('click', function(){ goTo(current + 1); });
      applyOrientation();
      videos.forEach(function(video){
        video.defaultMuted = false;
        video.muted = false;
        video.volume = 1;
        video.pause();
        video.addEventListener('play', function(){
          video.defaultMuted = false;
          video.muted = false;
          video.volume = 1;
          videos.forEach(function(other){ if(other !== video){ other.pause(); } });
        });
      });
    }
  })();

  // Останавливаем другие ролики, когда пользователь включает новое видео.
  (function(){
    var pageVideos = Array.prototype.slice.call(document.querySelectorAll('video:not(.cover-duet-spotlight-video)'));
    pageVideos.forEach(function(video){
      video.addEventListener('play', function(){
        pageVideos.forEach(function(other){ if(other !== video){ other.pause(); } });
      });
    });
  })();

  document.querySelectorAll('[data-acc-trigger]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.closest('[data-acc]');
      var body = item.querySelector('.acc-body');
      var isOpen = item.classList.contains('open');

      if(!window.matchMedia('(max-width:760px)').matches){
        document.querySelectorAll('[data-acc]').forEach(function(other){
          if(other !== item){
            other.classList.remove('open');
            other.querySelector('.acc-body').style.maxHeight = null;
            other.querySelector('[data-acc-trigger]').setAttribute('aria-expanded','false');
          }
        });
      }

      if(isOpen){
        item.classList.remove('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(function(){
          body.style.maxHeight = null;
        });
        btn.setAttribute('aria-expanded','false');
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        function finishAccordionOpen(){
          if(item.classList.contains('open')){ body.style.maxHeight = 'none'; }
        }
        body.addEventListener('transitionend', function handler(event){
          if(event.target !== body) return;
          finishAccordionOpen();
          body.removeEventListener('transitionend', handler);
        });
        // Some mobile browsers skip transitionend when the page is backgrounded or motion is reduced.
        setTimeout(finishAccordionOpen, 700);
        btn.setAttribute('aria-expanded','true');
        setTimeout(function(){
          btn.scrollIntoView({ behavior:'smooth', block:'start' });
        }, 100);
      }
    });
  });

  // ===== EVENT FILTERS IN TOP NAV =====
  (function(){
    function openEventBlock(id, updateHash){
      var item = document.getElementById(id);
      if(!item || !item.hasAttribute('data-acc')){ return; }
      var trigger = item.querySelector('[data-acc-trigger]');
      if(!item.classList.contains('open') && trigger){ trigger.click(); }
      else{ item.scrollIntoView({behavior:'smooth', block:'start'}); }
      if(updateHash){ history.replaceState(null, '', '#' + id); }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-event-filter]')).forEach(function(link){
      link.addEventListener('click', function(event){
        event.preventDefault();
        openEventBlock(link.getAttribute('href').slice(1), true);
      });
    });

    var initialId = window.location.hash.slice(1);
    if(initialId === 'corporate' || initialId === 'weddings' || initialId === 'birthdays'){
      setTimeout(function(){ openEventBlock(initialId, false); }, 120);
    }
  })();

  // ===== PROGRAM TOGGLE =====
  document.querySelectorAll('[data-prog-trigger]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var content = btn.nextElementSibling;
      var isOpen = btn.classList.contains('open');
      if(isOpen){
        btn.classList.remove('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        requestAnimationFrame(function(){ content.style.maxHeight = null; });
      } else {
        btn.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        content.addEventListener('transitionend', function handler(){
          if(btn.classList.contains('open')){ content.style.maxHeight = 'none'; }
          content.removeEventListener('transitionend', handler);
        });
      }
      // recalculate parent accordion height
      var accBody = btn.closest('.acc-body');
      if(accBody){
        setTimeout(function(){ accBody.style.maxHeight = 'none'; }, 600);
      }
    });
  });

  // ===== FULLSCREEN PHOTO VIEWER =====
  (function(){
    var lightbox = document.getElementById('photoLightbox');
    var lightboxImage = document.getElementById('photoLightboxImage');
    var counter = document.getElementById('photoLightboxCounter');
    var caption = document.getElementById('photoLightboxCaption');
    var closeBtn = document.getElementById('photoLightboxClose');
    var prevBtn = document.getElementById('photoLightboxPrev');
    var nextBtn = document.getElementById('photoLightboxNext');
    var stage = document.getElementById('photoLightboxStage');
    if(!lightbox || !lightboxImage){ return; }

    var definitions = [
      {root:'#gallery', selector:'.gallery-grid img', title:'Общая галерея'},
      {root:'#weddings', selector:'.ph-grid-uniform img', title:'Свадьбы'},
      {root:'#corporate', selector:'.ph-grid-uniform img', title:'Корпоративы'},
      {root:'#birthdays', selector:'.ph-grid-uniform img', title:'Дни рождения'},
      {root:'#cover-band', selector:'.band-member img', title:'Кавер-группа «То, что надо»'}
    ];
    var activeImages = [];
    var activeTitle = '';
    var current = 0;
    var lastFocus = null;
    var touchStartX = 0;

    function imageSource(image){
      return image.currentSrc || image.getAttribute('src') || '';
    }

    function render(){
      var image = activeImages[current];
      if(!image){ return; }
      lightboxImage.src = imageSource(image);
      lightboxImage.alt = image.alt || activeTitle;
      counter.textContent = activeTitle + ' · ' + (current + 1) + ' / ' + activeImages.length;
      caption.textContent = image.alt || activeTitle;
      var hasSeveral = activeImages.length > 1;
      prevBtn.hidden = !hasSeveral;
      nextBtn.hidden = !hasSeveral;
    }

    function open(images, title, index, trigger){
      activeImages = images;
      activeTitle = title;
      current = index;
      lastFocus = trigger;
      render();
      lightbox.hidden = false;
      document.body.classList.add('photo-lightbox-open');
      closeBtn.focus({preventScroll:true});
    }

    function close(){
      if(lightbox.hidden){ return; }
      lightbox.hidden = true;
      lightboxImage.removeAttribute('src');
      document.body.classList.remove('photo-lightbox-open');
      if(lastFocus){ lastFocus.focus({preventScroll:true}); }
    }

    function move(step){
      if(activeImages.length < 2){ return; }
      current = (current + step + activeImages.length) % activeImages.length;
      render();
    }

    definitions.forEach(function(definition){
      var root = document.querySelector(definition.root);
      if(!root){ return; }
      var images = Array.prototype.slice.call(root.querySelectorAll(definition.selector));
      images.forEach(function(image,index){
        image.setAttribute('tabindex','0');
        image.setAttribute('role','button');
        image.setAttribute('aria-haspopup','dialog');
        image.setAttribute('aria-label','Открыть фотографию ' + (index + 1) + ' из раздела «' + definition.title + '»');
        image.addEventListener('click',function(){ open(images,definition.title,index,image); });
        image.addEventListener('keydown',function(event){
          if(event.key === 'Enter' || event.key === ' '){
            event.preventDefault();
            open(images,definition.title,index,image);
          }
        });
      });
    });

    closeBtn.addEventListener('click',close);
    prevBtn.addEventListener('click',function(){ move(-1); });
    nextBtn.addEventListener('click',function(){ move(1); });
    stage.addEventListener('click',function(event){ if(event.target === stage){ close(); } });
    stage.addEventListener('touchstart',function(event){ touchStartX = event.changedTouches[0].clientX; },{passive:true});
    stage.addEventListener('touchend',function(event){
      var distance = event.changedTouches[0].clientX - touchStartX;
      if(Math.abs(distance) >= 45){ move(distance < 0 ? 1 : -1); }
    },{passive:true});

    document.addEventListener('keydown',function(event){
      if(lightbox.hidden){ return; }
      if(event.key === 'Escape'){ close(); }
      else if(event.key === 'ArrowLeft'){ move(-1); }
      else if(event.key === 'ArrowRight'){ move(1); }
      else if(event.key === 'Tab'){
        var controls = [closeBtn,prevBtn,nextBtn].filter(function(button){ return !button.hidden; });
        var first = controls[0];
        var last = controls[controls.length - 1];
        if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
        else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
      }
    });
  })();

  // ===== TESTIMONIAL CAROUSEL =====
  (function(){
    var track = document.getElementById('testiTrack');
    var cards = track.querySelectorAll('.testi-card');
    var dots = document.querySelectorAll('.testi-dot');
    var prevBtn = document.getElementById('testiPrev');
    var nextBtn = document.getElementById('testiNext');
    var mobileReviews = window.matchMedia('(max-width:760px)');
    var current = 0;
    var heightTimer;

    function updateReviewHeight(){
      if(!mobileReviews.matches){
        track.style.height = '';
        return;
      }
      var activeCard = cards[current];
      if(activeCard && activeCard.offsetHeight){
        track.style.height = activeCard.offsetHeight + 'px';
      }
    }

    function goTo(index, instant){
      current = (index + cards.length) % cards.length;
      if(mobileReviews.matches){
        track.style.transform = 'none';
        track.scrollTo({left:cards[current].offsetLeft,behavior:instant ? 'auto' : 'smooth'});
      }else{
        track.scrollLeft = 0;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
      }
      dots.forEach(function(d,i){ d.classList.toggle('active', i===current); });
      requestAnimationFrame(updateReviewHeight);
      window.setTimeout(updateReviewHeight, 120);
    }

    prevBtn.addEventListener('click', function(){ goTo(current - 1); });
    nextBtn.addEventListener('click', function(){ goTo(current + 1); });
    dots.forEach(function(d,i){ d.addEventListener('click', function(){ goTo(i); }); });

    var touchStartX = 0;
    track.addEventListener('touchstart', function(e){
      touchStartX = e.changedTouches[0].clientX;
    }, {passive:true});
    track.addEventListener('touchend', function(e){
      var distance = e.changedTouches[0].clientX - touchStartX;
      if(Math.abs(distance) < 45) return;
      goTo(current + (distance < 0 ? 1 : -1));
    }, {passive:true});

    track.addEventListener('scroll', function(){
      if(!mobileReviews.matches) return;
      window.clearTimeout(heightTimer);
      heightTimer = window.setTimeout(function(){
        current = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
        dots.forEach(function(d,i){ d.classList.toggle('active', i===current); });
        updateReviewHeight();
      }, 90);
    }, {passive:true});

    cards.forEach(function(card){
      var image = card.querySelector('img');
      if(image){ image.addEventListener('load', updateReviewHeight); }
    });

    if(mobileReviews.addEventListener){
      mobileReviews.addEventListener('change', function(){ goTo(current, true); });
    }
    requestAnimationFrame(function(){ goTo(0, true); });
  })();




  // ===== UPDATED CORPORATE PHOTOS =====
  (function(){
    var newPhotos = [
      {src:'corporate-fast-01.jpg', alt:'Ведущий проводит интерактив на корпоративном мероприятии', position:'center center'},
      {src:'corporate-fast-02.jpg', alt:'Ведущий на летнем корпоративном мероприятии', position:'center 32%'},
      {src:'corporate-fast-03.jpg', alt:'Ведущий с микрофоном на корпоративной вечеринке', position:'center 35%'},
      {src:'corporate-fast-04.jpg', alt:'Ведущий на сцене праздничного корпоративного вечера', position:'center 30%'},
      {src:'corporate-fast-05.jpg', alt:'Ведущий на новогодней корпоративной сцене', position:'center 38%'},
      {src:'corporate-fast-06.jpg', alt:'Ведущий с микрофоном на корпоративном празднике', position:'center 32%'}
    ];

    var extraCorporatePhotos = [
      {src:'corporate-fast-07.jpg', alt:'Общее фото гостей корпоративного праздника', position:'center 46%'},
      {src:'corporate-fast-08.jpg', alt:'Ведущий проводит интерактив с подарками', position:'center 30%'},
      {src:'corporate-fast-09.jpg', alt:'Ведущий проводит конкурс с гостями', position:'74% center'},
      {src:'corporate-fast-10.jpg', alt:'Ведущий общается с участниками корпоратива', position:'center center'}
    ];

    var corporateImages = Array.prototype.slice.call(
      document.querySelectorAll('#corp-grid img')
    );
    newPhotos.forEach(function(photo, index){
      if(!corporateImages[index]) return;
      corporateImages[index].src = photo.src;
      corporateImages[index].alt = photo.alt;
      corporateImages[index].style.objectPosition = photo.position;
      corporateImages[index].classList.add('new-event-photo');
    });

    var corporateGrid = document.getElementById('corp-grid');
    if(corporateGrid){
      extraCorporatePhotos.forEach(function(photo){
        var tile = document.createElement('div');
        var image = document.createElement('img');
        tile.className = 'ph';
        image.src = photo.src;
        image.alt = photo.alt;
        image.loading = 'lazy';
        image.className = 'new-event-photo';
        image.style.objectPosition = photo.position;
        tile.appendChild(image);
        corporateGrid.appendChild(tile);
      });
    }

    ['weddings','corporate','birthdays'].forEach(function(sectionId){
      var section = document.getElementById(sectionId);
      if(!section) return;
      var inner = section.querySelector('.acc-body-inner');
      var photos = inner && inner.querySelector('.ph-grid-uniform');
      if(!inner || !photos) return;
      photos.classList.add('event-photo-lead');
      inner.insertBefore(photos, inner.firstChild);
      if(sectionId === 'corporate'){
        var miniVideo = inner.querySelector('.corporate-mini-video-card');
        if(miniVideo){
          miniVideo.classList.add('ph','corporate-video-tile');
          photos.classList.add('has-corporate-video');
          photos.appendChild(miniVideo);
          var video = miniVideo.querySelector('video');
          var control = miniVideo.querySelector('.corporate-video-control');
          var controlIcon = control && control.querySelector('span');
          function ensureVideoSource(){
            if(!video || video.getAttribute('src')) return;
            video.dataset.selectedSrc = window.matchMedia('(max-width:760px)').matches
              ? video.dataset.mobileSrc
              : video.dataset.desktopSrc;
            video.src = video.dataset.selectedSrc;
            video.load();
          }
          function syncVideoControl(){
            var isPlaying = video && !video.paused && !video.ended;
            miniVideo.classList.toggle('is-playing', isPlaying);
            if(control){
              control.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
              control.setAttribute('aria-label', isPlaying ? 'Поставить видео на паузу' : 'Воспроизвести видео');
            }
            if(controlIcon){ controlIcon.textContent = isPlaying ? '❚❚' : '▶'; }
          }
          if(video && control){
            video.addEventListener('error', function(){
              var alternate = video.dataset.selectedSrc === video.dataset.mobileSrc
                ? video.dataset.desktopSrc : video.dataset.mobileSrc;
              if(!video.dataset.fallbackTried && alternate){
                video.dataset.fallbackTried = '1';
                video.dataset.selectedSrc = alternate;
                video.src = alternate;
                video.load();
                return;
              }
              miniVideo.classList.add('is-error');
              control.disabled = true;
              control.setAttribute('aria-label', 'Видео не удалось загрузить');
              if(controlIcon){ controlIcon.textContent = '!'; }
            });
            control.addEventListener('click', function(){
              ensureVideoSource();
              if(video.paused || video.ended){
                var attempt = video.play();
                if(attempt && typeof attempt.catch === 'function'){
                  attempt.catch(function(){
                    miniVideo.classList.add('is-error');
                    control.setAttribute('aria-label', 'Видео не удалось загрузить');
                    if(controlIcon){ controlIcon.textContent = '!'; }
                  });
                }
              } else { video.pause(); }
            });
            video.addEventListener('click', function(){ control.click(); });
            video.addEventListener('dblclick', function(event){ event.preventDefault(); });
            video.addEventListener('play', syncVideoControl);
            video.addEventListener('pause', syncVideoControl);
            video.addEventListener('ended', syncVideoControl);
            syncVideoControl();
          }
        }
      }
    });
  })();



(() => {
  const mobile = window.matchMedia('(max-width: 760px)');
  const entries = [
    { section: document.getElementById('cover-band'), slot: document.getElementById('format-band-video') },
    { section: document.getElementById('cover-duet'), slot: document.getElementById('format-duet-video') }
  ];
  for (const item of entries) {
    if (!item.section || !item.slot) continue;
    const videoWrap = item.section.querySelector('.band-video-wrap');
    if (!videoWrap) continue;
    const originalParent = videoWrap.parentNode;
    const originalNext = videoWrap.nextSibling;
    const move = () => mobile.matches
      ? item.slot.append(videoWrap)
      : originalParent.insertBefore(videoWrap, originalNext);
    move();
    mobile.addEventListener('change', move);
  }
})();
