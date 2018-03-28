# Scoop Analytics Visualisation System

The main focus of this tool is to highlight the relationship between share price increases and decreases and their
corresponding Twitter posts, known as tweets, in real-time. These tweets are identified by the algorithm provided
by Scoop Analytics which disambiguates meaningful content from junk based on a variety of different metrics.

The scope of the project was to create a dashboard that would emphasise the correlation between the instantaneous nature of social media and its effect on stock market shares. As such, the most crucial aspect of the visualisation was to show the live share price of a stock and have the capacity to fetch tweets corresponding to a significant increase or decrease in share price within a specified time frame.


# Files

Backend consists of a PostgreSQL databases which holds price data scraped from the Google Finance API.
Flask is used as the framework which contains the handlers for the web scraper and all of the Twitter API endpoints.
Frontend is predominately written in D3.js for the data visualisation itself.

## JSDoc Files

There are a number of files outlining the base functionality of each of the functions, located in the **static/js/out** folder. By opening **global.html**, you can browse all of the available function documentation and the code itself.

## Setup

Flask is a core dependency of the application and to run the application, it must be installed on your local machine. In order to run the program, navigate to the **scoop_analytics** folder and execute the following in a terminal:

*export FLASK_APP=\_\_init\_\_.py*
*flask run*

Then navigate your browser to **http://127.0.0.1:5000**.