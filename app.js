'use strict';

const form = document.querySelector('.form');
const containerPlaces = document.querySelector('.places');
const inputType = document.querySelector('.form__input--type');
const inputName = document.querySelector('.form__input--name');
const inputPrice = document.querySelector('.form__input--price');
const inputStars = document.querySelector('.form__input--stars');
const inputDishName = document.querySelector('.form__input--dish');
const inputDrinkName = document.querySelector('.form__input--drink');

class Place {
    date = new Date();
    id = Date.now();

    constructor(placeName,coords, price, rating) {
        this.placeName = placeName;
        this.coords = coords;
        this.price = price; 
        this.rating = rating;
        this.calcIndex();
    }

    calcIndex() {
        this.index = (this.price / this.rating) / 100;
        return this.index;
    }
}

class Food extends Place {
    type = "food"
    constructor(placeName, coords, price, rating, bestDish) {
        super(placeName, coords, price, rating);
        this.bestDish = bestDish;
    }
}
class Bar extends Place {
    type = "bar"
    constructor(placeName, coords, price, rating, bestDrink) {
        super(placeName, coords, price, rating);
        this.bestDrink = bestDrink;
    }
}


class App {

    #map;
    #mapEvent;
    #mapZoom = 13;
    #places = [];
    
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newPlace.bind(this))
        inputType.addEventListener('change', this._toggleDishDrink);
        containerPlaces.addEventListener('click', this._moveToPopup.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert('Could not get your position')
            });
        }
    }

    _loadMap(position) {

        const {
            latitude
        } = position.coords;
        const {
            longitude
        } = position.coords;

        const coords = [latitude, longitude]

        console.log(coords);
        console.log(this);

        this.#map = L.map('map').setView(coords, this.#mapZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);


        // Handling map click
        this.#map.on('click', this._showForm.bind(this))
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputName.focus()
    }


    _newPlace(e) {
        e.preventDefault();
        //  Get form data
        const type = inputType.value;
        const placeName =  inputName.value
        const price =  +inputPrice.value;
        const rating = +inputStars.value;
        let place;
        const {
            lat,
            lng
        } = this.#mapEvent.latlng;

        if(type === 'bar' && placeName !== '' && price !==0) {
            const drink = inputDrinkName.value;
            place = new Bar(placeName,[lat, lng], price, rating, drink);
            // placeName, coords, price, rating, bestDish
        }


        if(type === 'food' && placeName !== '' && price !==0) {
            const dish = inputDishName.value;
            place = new Food(placeName,[lat, lng], price, rating, dish);
        } 
        
        this.#places.push(place);

        // Display marker
        this._renderPlaceMarker([lat,lng], type, placeName)

        // Display leftside

        this._renderPlace(place)

        // inputType.value = inputName.value = inputPrice.value = inputStars.value = inputDishName = null;

        this._hideForm()
    }


    _toggleDishDrink() {
        inputDishName.closest('.form__row').classList.toggle('form__row--hidden');
        inputDrinkName.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _renderPlaceMarker(latlng, type, placeName) {
        L.marker(latlng).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${type}-popup`
        }))
        .setPopupContent(`${placeName}`)
        .openPopup();
    }

    _renderPlace(place) {
        let html = 
        `
        <li class="place place--${place.type}" data-id="${place.id}">
        <h2 class="place__title">${place.placeName}</h2>
        <div class="place__details">
          <span class="place__icon">💵</span>
          <span class="place__value">${place.price}</span>
          <span class="place__unit">$</span>
        </div>
        <div class="place__details">
          <span class="place__icon">⭐️</span>
          <span class="place__value">${place.rating}</span>
        </div>
        <div class="place__details">
          <span class="place__icon">🆔</span>
          <span class="place__value">${place.index.toFixed(2)}</span>
          <span class="place__unit">rat</span>
        </div>
        `;
        if(place.type === 'food') {
            html += `<div class="place__details">
            <span class="place__icon">🌭</span>
            <span class="place__value">${place.bestDish}</span>
          </div>
          </li>`}
        if(place.type === 'bar') {
            html += `<div class="place__details">
            <span class="place__icon">🍺</span>
            <span class="place__value">${place.bestDrink}</span>
          </div
          </li>`

    }

        const list = document.querySelector('.places');
        list.insertAdjacentHTML('beforeend', html);

    }

    _hideForm() {
        inputName.value = inputPrice.value = inputStars.value = inputDishName.value = inputDishName.value = '';

        form.classList.add('hidden');
    }

    _moveToPopup(e) {

        const placeEl = e.target.closest('.place');

        const elID = this.#places.find(
            el => el.id == placeEl.dataset.id
          )

        this.#map.setView(elID.coords, 13, {
            animate: true,
            pan: {
                duration: 1
            }
        });
    }
}

const app = new App();