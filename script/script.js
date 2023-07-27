$(document).ready(function() {
    // Variables globales para guardar los libros obtenidos
    let librosFavoritos = [];
    let librosMasVistos = [];
    let categorias = [];
  
    // Obtener libros favoritos almacenados en el LocalStorage (si hay alguno)
    if (localStorage.getItem("favoritos")) {
      librosFavoritos = JSON.parse(localStorage.getItem("favoritos"));
    }
  
    // Evento click del menú "Mis favoritos"
    $("#favoritos").click(function(e) {
      e.preventDefault();
      mostrarLibrosFavoritos();
    });
  
    // Evento click del menú "Mas vistos"
    $("#mas-vistos").click(function(e) {
      e.preventDefault();
      obtenerLibrosMasVistos();
    });
  
    // Evento click del menú "Libros por categorias"
    $("#categorias").click(function(e) {
      e.preventDefault();
      obtenerCategorias();
    });
  
   
  
    // Función para obtener los libros mas vistos y mostrarlos
    function obtenerLibrosMasVistos() {
      $("#contenedorfull").empty();
      $.ajax({
        url: "https://www.etnassoft.com/api/v1/get/?criteria=most_viewed",
        method: "GET",
        dataType: "json",
        success: function(data) {
          librosMasVistos = data;
          for (const libro of librosMasVistos) {
            mostrarLibroEnContenedor(libro);
          }
        },
        error: function() {
          $("#contenedorfull").html("<p>Error al obtener los libros mas vistos.</p>");
        }
      });
    }
    // Función para obtener los libros favoritos y mostrarlos
    function mostrarLibrosFavoritos() {
      $("#contenedorfull").empty();
      if (librosFavoritos.length > 0) {
        for (const libro of librosFavoritos) {
          mostrarLibroEnContenedor(libro);
        }
      } else {
        $("#contenedorfull").html("<p>No hay libros favoritos.</p>");
      }
    }
    // Función para obtener las categorías de libros y mostrarlas en un menú desplegable
    function obtenerCategorias() {
      $.ajax({
        url: "https://www.etnassoft.com/api/v1/get/?get_categories=all",
        method: "GET",
        dataType: "json",
        success: function(data) {
          categorias = data;
          let opciones = '<option value="">Seleccione una categoría</option>';
          for (const categoria of categorias) {
            opciones += `<option value="${categoria.category_id}">${categoria.name}</option>`;
          }
          const listaDesplegable = `<select id="categorias-select">${opciones}</select>`;
          $("#contenedorfull").html(listaDesplegable);
  
          // Evento change del menú desplegable de categorías
          $("#categorias-select").change(function() {
            const categoriaSeleccionada = $(this).val();
            obtenerLibrosPorCategoria(categoriaSeleccionada);
          });
        },
        error: function() {
          $("#contenedorfull").html("<p>Error al obtener las categorías de libros.</p>");
        }
      });
    }
  
    // Función para obtener los libros de una categoría seleccionada y mostrarlos
    function obtenerLibrosPorCategoria(categoriaId) {
      $("#contenedorfull").empty();
      $.ajax({
        url: `https://www.etnassoft.com/api/v1/get/?category_id=${categoriaId}`,
        method: "GET",
        dataType: "json",
        success: function(data) {
          for (const libro of data) {
            mostrarLibroEnContenedor(libro);
          }
        },
        error: function() {
          $("#contenedorfull").html("<p>Error al obtener los libros de la categoría seleccionada.</p>");
        }
      });
    }
  
    // Función para mostrar un libro en el contenedor full
    function mostrarLibroEnContenedor(libro) {
      const libroHTML = `
        <div class="libro">
          <img src="${libro.cover}" alt="${libro.title}" data-id="${libro.ID}">
          <h3>${libro.title}</h3>
          <button class="ver-detalle">Ver detalle</button>
          <button class="agregar-favorito">Agregar a favoritos</button>
          <button class="eliminar-favorito" style="display:none;">Eliminar</button>
        </div>
      `;
      $("#contenedorfull").append(libroHTML);
    }
  
    // Evento click para ver el detalle de un libro
    $("#contenedorfull").on("click", ".ver-detalle", function() {
      const libroId = $(this).siblings("img").data("id");
      obtenerDetalleLibro(libroId);
    });
  
    // Función para obtener el detalle de un libro
    function obtenerDetalleLibro(libroId) {
      $.ajax({
        url: `https://www.etnassoft.com/api/v1/get/?id=${libroId}`,
        method: "GET",
        dataType: "json",
        success: function(data) {
          $("#autor").text(data[0].author);
          $("#sinopsis").text(data[0].content);
          $("#descarga").text(data[0].url_descarga);
          $("#publicacion").text(data[0].publisher_date);
          $("#editorial").text(data[0].publisher);
          mostrarPopup();
        },
        error: function() {
          alert("Error al obtener el detalle del libro.");
        }
      });
    }
  
    // Función para mostrar el pop-up
    function mostrarPopup() {
      $("#popup").fadeIn();
    }
  
    // Evento click para agregar un libro a favoritos
    $("#popup").on("click", ".agregar-favorito", function() {
      const libroId = $(this).siblings("img").data("id");
      const libro = librosMasVistos.find((libro) => libro.ID === libroId);
      
      if (libro) {
        librosFavoritos.push(libro);
        localStorage.setItem("favoritos", JSON.stringify(librosFavoritos));
        mostrarLibrosFavoritos();
        $("#popup").fadeOut();
      }
    });
  
    // Evento click para eliminar un libro de favoritos
    $("#contenedorfull").on("click", ".eliminar-favorito", function() {
      const libroId = $(this).siblings("img").data("id");
      const index = librosFavoritos.findIndex((libro) => libro.ID === libroId);
      if (index !== -1) {
        librosFavoritos.splice(index, 1);
        localStorage.setItem("favoritos", JSON.stringify(librosFavoritos));
        mostrarLibrosFavoritos();
      }
    });
  });
  