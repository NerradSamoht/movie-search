upcoming();

function ukDate(dateString) {
  var year = dateString.substring(0, 4);
  var month = dateString.substring(5, 7);
  var day = dateString.substring(8, 10);
  var result = day + "/" + month + "/" + year;
  return result;
}

function upcoming() {

  $.getJSON("http://api.themoviedb.org/3/movie/upcoming?api_key=4120175e535d978bf6f3785ea754ffc2", function(data) {

    $.each(data.results, function(i, item) {

      if (item.poster_path && item.overview && item.release_date) {
        var poster = "http://image.tmdb.org/t/p/original" + item.poster_path;
        var id = item.id;
        var overview = item.overview;
        var release_date = ukDate(item.release_date);
        var title = item.title;

        $('.upcoming').append(
          "<div class='upcoming-movie'><a href='#two'><img id='" + id + "' height='154px' src='" + poster + "' ></a>" + '<h2>' + title + '</h2>' + '<p>Release date: ' + release_date + '</p>' + '<p>' + overview + '</p>' + "</div>"
        );
      };
    })

    $('.upcoming-movie img').click(function() {
      var movie_id = $(this).attr('id');
      getMovie(movie_id);
    });

  });
};

function getMovie($movie_id) {

  $.getJSON("http://api.themoviedb.org/3/movie/" + $movie_id + "?api_key=4120175e535d978bf6f3785ea754ffc2", function(data) {

    var runtime;
    if (data.runtime > 60) {
      var hours = Math.floor(data.runtime / 60);
      var hrs = hours > 1 ? hours + "hrs " : hours + "hr ";
      var minutes = data.runtime % 60;
      var mins = minutes > 1 ? minutes + "mins " : minutes + "min ";
      runtime = hrs + mins;
    } else {
      runtime = data.runtime + "mins";
    }
    var tagline = data.tagline;
    var backdrop = data.backdrop_path ? "http://image.tmdb.org/t/p/original" + data.backdrop_path : "";
    var title = data.title;
    var poster = "http://image.tmdb.org/t/p/w154" + data.poster_path;
    var overview = data.overview;

    var genres = data.genres;
    var genre = [];
    $.each(genres, function(index, val) {
      genre.push(val.name);
    });

    var release_date = data.release_date;
    var year = release_date.substring(0, 4);
    var month = release_date.substring(5, 7);
    var day = release_date.substring(8, 10);

    release_date = day + "/" + month + "/" + year;

    $('html, body').animate({
      scrollTop: 0
    }, 0);
    backdrop ? $('.bg').html("<img width='100%' src='" + backdrop + "' />") : "";
    $('#tagline').html(tagline);
    $('#tagline, .bg').show();
    $('#title').text(title);
    $('#main_img').attr("src", poster);
    $('#overview').html(overview);
    $('#details').html("<li>Release date: " + release_date + "</li><li>Runtime: " + runtime + "</li><li>Genre: " + genre.join(', ') + "</li>");

  })

  $.getJSON("http://api.themoviedb.org/3/movie/" + $movie_id + "/credits?api_key=4120175e535d978bf6f3785ea754ffc2", function(data) {

    $('.credit').remove();

    $.each(data.cast, function(i, item) {
      var profile_path = "assets/noImage_md.png";
      if (item.profile_path !== null) {
        profile_path = "http://image.tmdb.org/t/p/w154" + item.profile_path;
      }
      var actor_id = item.id;
      var $actor = "<ul class='credit'><li class='poster'><img class='actor_img' id=" + actor_id + " src='" + profile_path + "'/></li><li class='name'>" + item.name + "<li class='character'>" + item.character + "</li>";
      $('#credits').append($actor);
    })

    $('.actor_img').click(function() {
      var actor_id = $(this).attr('id');
      getActor(actor_id);
    });

  })
}

function getAge(birthString, deathString) {
  var deathDate = new Date(deathString);

  if (typeof deathString === "undefined" || deathString === null) {
    deathDate = new Date();
  }

  var birthDate = new Date(birthString);
  var age = deathDate.getFullYear() - birthDate.getFullYear();
  var m = deathDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && deathDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getActor($actor_id) {

  var age;
  var dob;

  $.getJSON("http://api.themoviedb.org/3/person/" + $actor_id + "?&api_key=4120175e535d978bf6f3785ea754ffc2", function(data) {

    $('input').val('');
    $('#tagline, .bg').hide();

    var bio = data.biography ? data.biography : "";
    var death = data.deathday;
    var name = data.name;
    var place_of_birth = data.place_of_birth;
    var profile_img = data.profile_path ? "http://image.tmdb.org/t/p/w154" + data.profile_path : "assets/noImage_md.png";

    dob = data.birthday;
    if (dob) {
      if (dob && death) {
        age = getAge(dob, death);
      } else {
        age = getAge(dob);
      }
    }

    $('html, body').animate({
      scrollTop: 0
    }, 0);
    $('#main_img').attr("src", profile_img);
    $('#title').text(name);

    var details = "";
    if (age) {
      var born = death ? ukDate(dob) + " - " + ukDate(death) : "Date of birth: " + ukDate(dob);
      details = "<li><span id='age'>Age: " + age + "</span></li><li>" + born + "</li>";
    }
    if (place_of_birth) {
      details = details + "<li>Place of birth: " + place_of_birth + "</li>";
    }

    $('#details').html(details);
    $('#overview').text(bio);

  })

  $.getJSON("http://api.themoviedb.org/3/person/" + $actor_id + "/credits?api_key=4120175e535d978bf6f3785ea754ffc2", function(data) {

    $('.credit').remove();

    var movie_array = [];

    $.each(data.cast, function(i, item) {

      var character = item.character;
      var actor_id = item.id;
      var poster_path = "assets/noImage_md.png";
      if (item.poster_path) {
        poster_path = "http://image.tmdb.org/t/p/w154/" + item.poster_path;
      }

      var release_date = "";
      var age_at_release = "";

      if (item.release_date) {
        release_date = item.release_date.substring(0, 4);
        age_at_release = getAge(dob, item.release_date);
      }
      var title = "";
      if (item.title) {
        title = title = item.title;
      }

      var $movies = "<ul class='credit'><li class='release_date'>";
      if (release_date) {
        $movies = $movies + release_date;
      }
      $movies = $movies + "</li>";
      if (poster_path) {
        $movies = $movies + "<li class='poster'><img class='poster_img' id='" + actor_id + "' src='" + poster_path + "'/>";
      }
      if (age_at_release) {
        $movies = $movies + "<span class='age_at_release'>" + age_at_release + "</span>";
      }
      $movies = $movies + "</li>";
      if (title) {
        $movies = $movies + "<li class='name'>" + title + "</li>";
      }
      if (character) {
        $movies = $movies + "<li class='character'>" + character + "</li>";
      }
      $movies = $movies + "</ul>";

      movie_array.push({
        year: item.release_date,
        details: $movies
      });

    })

    movie_array.sort(function(a, b) {
      var x = a['year'],
        y = b['year'];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });

    $.each(movie_array, function(i, item) {
      $('#credits').append(item.details);
    });


    $('#age').click(function() {
      $('.age_at_release').toggle();
    });

    $('.poster_img').click(function() {
      var movie_id = $(this).attr('id');
      getMovie(movie_id);
    });

  })
};
