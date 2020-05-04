/**
 * Note: This is a very ugly knot of Regex and ternary statements. It seems ot have done a reasonable job of parsing names,
 * ages, and origin data from the original html elements of the transcript. 
 *
 * THIS IS HERE TO PROVIDE SOME TRANPARENCY ABOUT HOW THE FINAL JSON DATA IS DERIVED.
 * I DO NOT THINK THIS IS NECESSARILY A GOOD OR ELEGANT WAY TO DO THE JOB OF PARSING THIS DATA.
 * PLEASE DO NOT USE THIS AS AN EXAMPLE FOR ANYTHING.
 *
 * PR are welcome for people who can do this job in a nicer way.
 */

const fs = require('fs')
const entriesString = process.argv.slice(2).map(file => fs.readFileSync(file, 'utf-8')).join('\n')
const entries = entriesString.split('\n')
let ship = ''
let badEntries = []

function findPreviousSlavery(strippedEntry){
  // This is a big ugly regex. There is porbably a better way to do this, but its grown very big with all of the case I want to match.
  const slaveryRegex = /([F,f]ormerly the property of |[F,f]ormerly slave to |[F,f]ormerly servant to |[F,f]ormerly a servant to |[L,l]ived with |[L,l]ived at |[F,f]amily of |[F,f]ormerly served |[F,f]ormerly |[F,f]ree born in the family of |[F,f]ree born in |bound with |Property of )(.*?)(\,|\bin|\b[o,O]f\b|\bat\b|\bnear\b|\.$)(.*?)(\;|\.|whom|who|$)/
  return strippedEntry.match(slaveryRegex)
}

function findFormerOwner(previousSlavery){
  return previousSlavery ? previousSlavery[2].trim() : null
}

function findEscape(strippedEntry){
  const escapeMatch = strippedEntry.match(/(\;)(.*)/) 
  return escapeMatch ? escapeMatch[2] : null
}

// parse ages and nomralize them to years
function parseAge(age){
  //parse out arges for children who's age is in months
  const inMonths = age.match(/(\d+) month/)
  const inYears = parseInt(age)

  let parsedAge = inMonths ? inMonths[1] : inYears

  if(age.match(/\½/)){
    parsedAge += .5
  }

  if(inMonths){
    parsedAge = parsedAge / 12
    parsedAge = parsedAge.toFixed(2)
  }

  return parsedAge
}

function findColony(previousSlavery, strippedEntry){
  const colony = previousSlavery && previousSlavery[4] ? previousSlavery[4].split(/,|\bin\b/) : null

  //if the colony wasn't found with the previous salvery regex, the lets try finding it the hard way...
  const coloniesRegex = /Pennsylvania|New York|Virginia|Rhode Island|New Jersey|Maryland|North Carolina|South Carolina|Carolina|Georgia|Massachusetts|Connecticut|West Indies|Antigua|Jamaica|Jersey|Long Island|Mont Serrat|Barbadoes|St. Croix|Cape Francois|Bermuda|New England/i
  const bornFreeRegex = /(Born free at |Born free, )(.*?)[\.,$]/
  const citiesRegex = /Charleston|Charlestwon|Charlestown|Savannah|Boston|River St. John's|Philadelphia|Phillipsburgh|Annapolis|Baltimore|Setockett/i

  const rawColony = strippedEntry.match(coloniesRegex)
  const bornFreeColony = strippedEntry.match(bornFreeRegex)
  const rawCity = strippedEntry.match(citiesRegex)
  const filteredColony = colony && colony.length > 1 ? colony[1].match(coloniesRegex) : null
  const colonyObj = {
    city: colony ? colony[0].trim() : bornFreeColony ? bornFreeColony[2].trim() : rawCity ? rawCity[0] : null,
    colony: filteredColony ? filteredColony[0] : rawColony ? rawColony[0] :  null
  }

  // try and filter the phrase "came to new york"
  if(strippedEntry.match(/came to New York/) && colonyObj.colony === "New York"){
    colonyObj.colony = null
  }
  if(strippedEntry.match(/Lord Baltimore/) && colonyObj.city === "Baltimore"){
    colonyObj.city = null
  }
  if(colonyObj.city && colonyObj.city.match(coloniesRegex) && colonyObj.city === colonyObj.colony){
    colonyObj.city = null
  }

  return colonyObj
}

function iteratePossibilites(...posibilites){
  return
}

function findEscapeYear(strippedEntry){
  const escapeYear = strippedEntry.match(/(\d*\½?) years ago/)
  const computedEscape = escapeYear ? 1783 - parseInt(escapeYear[1]) : null
  const literalYear = strippedEntry.match(/17\d\d/)
  return computedEscape ? computedEscape : literalYear ? literalYear[0] : null
}

let badCount = 0;

const jsonObj = entries.reduce((total, entry, index)=> {
  const strippedEntry = entry.replace(/<.*?>/g,'')
  if (entry.match(/\"center\"/) && entry.match(/<i>.*<\/i>/)){
    const shipName = entry.match(/<i>.*<\/i>/)[0].replace(/<.*?>/g,'')
    const destination = strippedEntry.match(/(?<=bound for )(St\. .*? |St\. John's|Port .*? |.*? |.*? Bay )/)
    //console.log('ship is: ', shipName)
    ship = {
      name: shipName.trim(),
      destination: destination ? destination[0].trim() : null
    }
    return total;
  }


  const columns = strippedEntry.split(',')
  //console.log('entry is: ', strippedEntry)

  if(!isNaN(parseInt(columns[1]))){
    try {
      const escape = findEscape(strippedEntry)
      const escapeYear = findEscapeYear(strippedEntry)
      const previousSlavery = findPreviousSlavery(strippedEntry)
      const formerOwner = findFormerOwner(previousSlavery)
      const colony = findColony(previousSlavery, strippedEntry)

      const structuredEntry = {
        index,
        name: columns[0],
        age: parseAge(columns[1]),
        ageString: columns[1].trim(),
        condition: columns[2] ? columns[2].trim() : null,
        formerOwner: formerOwner,
        city: colony.city,
        colony: colony.colony,
        escapeYear,
        rawEntry: strippedEntry,
        ship: Object.assign({}, ship)
      }
      return [...total, structuredEntry]
    } catch(err) {
      console.log('bad entry: ', strippedEntry, err)
      const badEntry = {
        index,
        badEntry: true,
        entry: strippedEntry
      }

      badEntries = [...badEntries, badEntry]
      return [...total, badEntry]
    }
  } else {
    badCount++
    badEntries.push({
      index,
      name: null,
      age: null,
      ageString: null,
      condition: null,
      formerOwner: null,
      city: null,
      colony: null,
      escapeYear: null,
      rawEntry: strippedEntry,
      ship: Object.assign({}, ship)
    })

    return total
  }

},[])

console.log('bad count: ', badCount)

//fs.writeFileSync('data.json', JSON.stringify(jsonObj, null, 4) , 'utf-8')
fs.writeFileSync('ignored-entries.json', JSON.stringify(badEntries, null, 4) , 'utf-8')
console.log(`wrote ${jsonObj.length} entries, with ${badEntries.length} bad entries`)
