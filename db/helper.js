module.exports = class Helper {
  assignRegion(lat, lng) {

    if ((lat >= 5.4960999 && lat <= 83.9702561) && (lng >= -8.2617199 && lng <= 170.5957)) {
      return 'North America';
    }

    else if ((lat >= -56.1455 && lat <= 17.6606999) && (lng >= -110.0281 && lng <= -28.650543)) {
      return 'South America';
    }

    else if ((lat >= 5.4960999 && lat <= 18.4959419) && (lng >= -92.2714 && lng <= -77.158487)) {
      return 'Central America';
    }

    else if ((lat >= -47.1313489 && lat <= 37.5359) && (lng >= -25.383911 && lng <= 63.808593)) {
      return 'Africa';
    }

    else if ((lat >= 34.5428 && lat <= 82.1673907) && (lng >= -31.4647999 && lng <= 74.355500)) {
      return 'Europe';
    }

    else if ((lat >= 11.7975 && lat <= 42.3666999) && (lng >= 24.696775 && lng <= 63.3333366)) {
      return 'Middle East';
    }

    else if ((lat >= -12.2118513 && lat <= 81.9661865) && (lng >= -168.97788 && lng <= 25.5886467)) {
      return 'Asia';
    }

    else if ((lat >= -54.83376578 && lat <= -9.1870264) && (lng >= 110.9510339 && lng <= 159.833765)) {
      return 'Australia';
    }

    else if ((lat >= -54.8337658 && lat <= 20.6584862) && (lng >= -124.5410156 && lng <= 110.9510339)) {
      return 'Oceania';
    }

    else if ((lat >= -90 && lat <= -60.1086999) && (lng >= -180 && lng <= 180)) {
      return 'Antarctica';
    }

    else if ((lat >= 51.175092 && lat <= 83.970256) && (lng >= -180 && lng <= 180)) {
      return 'Arctic';
    }

    else if ((lat >= -85.5827636 && lat <= 59.4822293) && (lng >= -66.5190814 && lng <= 128.576489)) {
      return 'Pacific Ocean';
    }

    else if ((lat >= -83.02044773 && lat <= 68.6187516) && (lng >= -83.2160952 && lng <= 20.0000002)) {
      return 'Atlantic Ocean';
    }

    else if ((lat >= -71.4421996 && lat <= 10.4233683) && (lng >= 13.2420357 && lng <= 146.9166667)) {
      return 'Indian Ocean';
    }

    else if ((lat >= 62.8298713 && lat <= 67.7034293) && (lng >= -68.9751267 && lng <= -55.8845072)) {
      return 'Arctic Ocean';
    }

    else if ((lat >= -68.4421138 && lat <= -68.43391245) && (lng >= -160.2500533 && lng <= -160.2180385)) {
      return 'Southern Ocean';
    }

    else {
      return null;
    }
  }

  dataCleaner(array, assignRegion) {
    return array.reduce((acc, quake) => {
      let quakeObj = {
        magnitude: quake.properties.mag,
        description: quake.properties.place,
        lat: quake.geometry.coordinates[1],
        long: quake.geometry.coordinates[0],
        depth: quake.geometry.coordinates[2],
        region: assignRegion(quake.geometry.coordinates[1], quake.geometry.coordinates[0])
      }

      acc.push(quakeObj)
      return acc
    }, []);
  }
};
