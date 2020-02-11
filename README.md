# The Book of Negroes Data

This is a dataset based on the 1783 document _The Book Of Negroes_. It is an attempt to make a transcript of the document in a machine-readable format for use in statistical analysis and to power visualizations.

From Wikipedia:

> The Book of Negroes is a document created by Brigadier General Samuel Birch that records names and descriptions of 3,000 Black Loyalists, enslaved Africans who escaped to the British lines during the American Revolution and were evacuated to points in Nova Scotia as free people of colour.

NOTE: This data is for the historical document, not the novel or TV miniseries of the same name.

## Source Data

This data is based on the [HTML transcript](http://epe.lac-bac.gc.ca/100/200/301/ic/can_digital_collections/blackloyalists/index.htm) of the _Book of Negroes_ hosted by The National Library of Canada. This version is recommended by the National Library of Canada. Because of redirects, I do not parse the entire sites. Rather, I have manually retrieved the relevant html elements for parsing.

## Conversion and Formatting

This data has been transformed into JSON format using a big, ugly, Node.js script. It has been included here for transparency purposes.

## Limitations of This Data
The original transcript is formatted in similar, but subtly different ways. I have tried to extract the most useful information (at least to me) in a reasonable manner. I have done some spot check on the accuracy of the data, but cannot guarantee the accuracy of every record.

If you are doing genealogical research, The Nova Scotia Archives provides [a cleaner, but more limited dataset](https://data.novascotia.ca/Arts-Culture-and-History/-Book-of-Negroes-1783/xxcy-v3fh) that will useful for family research and more official.

The original transcript is provided in each entry, please use the original entry as the main source of truth about a particular record.

## Contributing
Pull requests against the parsing script or the data itself are welcome. I will use source transcript to vet all changes. I'm not willing to incorporate data from other versions of the document.

## Copyright
I am not the copyright owner of the original source data. I am assuming the that because this is a historical document and is hosted by a national library that it is more or less in the public domain.

If you are the copyright holder of this document, please be in touch. I would love to work more formally to make this data available in a machine readable format.

That being said, the work contained in this repo outside of the `raw-data` directory is in the public domain. Feel free to use this data as you wish, but I provide no implied or express warranty for anything in this repo.
