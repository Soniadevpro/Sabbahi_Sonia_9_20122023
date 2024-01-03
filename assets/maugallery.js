(function ($) {
  // Stockage des sélecteurs fréquemment utilisés
  var $galleryItems = $(".gallery-item");
  var $gallery = $(".gallery");

  $.fn.mauGallery = function (options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function () {
      var $this = $(this); // Stockage de $(this) dans une variable
      $.fn.mauGallery.methods.createRowWrapper($this);
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox($this, options.lightboxId, options.navigation);
      }
      $.fn.mauGallery.listeners(options);

      $this.children(".gallery-item").each(function () {
        var $item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.moveItemInRowWrapper($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, options.columns);
        addTagToCollection($item, tagsCollection, options);
      });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($this, options.tagsPosition, tagsCollection);
      }

      $this.fadeIn(500);
    });
  };

  function addTagToCollection(item, collection, options) {
    var theTag = item.data("gallery-tag");
    if (options.showTags && theTag !== undefined && collection.indexOf(theTag) === -1) {
      collection.push(theTag);
    }
  }

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  $.fn.mauGallery.listeners = function (options) {
    // Utilisation d'événements délégués
    $(document).on("click", ".gallery-item", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $gallery.on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $gallery.on("click", ".mg-prev", () => $.fn.mauGallery.methods.prevImage(options.lightboxId));
    $gallery.on("click", ".mg-next", () => $.fn.mauGallery.methods.nextImage(options.lightboxId));
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      // Simplification de la logique de gestion des colonnes
      var columnClasses = "item-column mb-4 ";
      if (typeof columns === "number") {
        columnClasses += `col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === "object") {
        columnClasses += Object.keys(columns)
          .map((size) => ` col-${size}-${Math.ceil(12 / columns[size])}`)
          .join("");
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
      element.wrap(`<div class='${columnClasses}'></div>`);
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      var $lightbox = $(`#${lightboxId}`);
      $lightbox.find(".lightboxImage").attr("src", element.attr("src"));
      $lightbox.modal("toggle");
    },
    prevImage(lightboxId) {
      navigateLightbox(-1, lightboxId);
    },
    nextImage(lightboxId) {
      navigateLightbox(1, lightboxId);
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
              <img class="lightboxImage img-fluid" alt="Image content displayed in modal on click"/>
              ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>' : '<span style="display:none;" />'}
            </div>
          </div>
        </div>
      </div>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">All</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      var $this = $(this);
      if ($this.hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active-tag");
      $this.addClass("active-tag");

      var tag = $this.data("images-toggle");
      $galleryItems.each(function () {
        var $itemColumn = $(this).closest(".item-column");
        $itemColumn.hide();
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          $itemColumn.show(300);
        }
      });
    },
  };

  function navigateLightbox(direction, lightboxId) {
    var $lightboxImage = $(`#${lightboxId} .lightboxImage`);
    var currentSrc = $lightboxImage.attr("src");
    var $currentItem = $galleryItems.filter(function () {
      return $(this).attr("src") === currentSrc;
    });
    var currentIndex = $galleryItems.index($currentItem);
    var nextIndex = (currentIndex + direction + $galleryItems.length) % $galleryItems.length;
    var nextSrc = $galleryItems.eq(nextIndex).attr("src");
    $lightboxImage.attr("src", nextSrc);
  }
})(jQuery);
