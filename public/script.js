// Cache DOM Elements
// These elements are referenced throughout the script to update the UI dynamically.
const resultsContainer = document.getElementById('resultsContainer'); // Container for results
const resultsTable = document.getElementById('resultsTable').querySelector('tbody'); // Table body for displaying results
const prevButton = document.getElementById('prevButton'); // Pagination: Previous button
const nextButton = document.getElementById('nextButton'); // Pagination: Next button
const errorMessage = document.getElementById('errorMessage'); // Container for error messages
const loader = document.querySelector('.loader'); // Loader to indicate loading state
const recordInfo = document.getElementById('recordInfo'); // Displays record information (e.g., "Showing records 1 to 50")
const totalRecordCountElement = document.getElementById('totalRecordCount'); // Displays the total number of records
let currentPage = 1; // Current page number for pagination

// Event Listeners for Form Submission and Pagination
document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
    currentPage = 1; // Reset to the first page for a new search
    console.log("Search Form Submitted: Resetting to Page 1");
    await fetchResults(); // Fetch search results

});

prevButton.addEventListener('click', async () => {
    currentPage -= 1; // Decrease current page number
    console.log("Previous Button Clicked: Current Page:", currentPage);
    await fetchResults(); // Fetch results for the new page
});

nextButton.addEventListener('click', async () => {
    currentPage += 1; // Increase current page number
    console.log("Next Button Clicked: Current Page:", currentPage);
    await fetchResults(); // Fetch results for the new page
});

// Get Default Dates for Filters
// This function calculates a default date range of the last 60 days.
function getDefaultDates() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 180); // Set the start date to 60 days before today
    return {
        startDate: start.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: today.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
}

// Build Filters
// Constructs the filters object based on user input from the form.
function buildFilters() {
    const keyword = document.getElementById('keyword').value.trim(); // Get keyword
    const agencyTypeElement = document.getElementById('agencyType'); // Get agency type element
    const agencyType = agencyTypeElement ? agencyTypeElement.value.trim() : ""; // Get agency type value
    const subAgencyType = document.getElementById('subAgencyType').value.trim(); // Get sub-agency type
    const agencyDetails = document.getElementById('agencyDetails').value.trim(); // Get agency details
    const placeOfPerformanceScope = document.getElementById('placeOfPerformanceScope').value.trim(); // Get place of performance scope
    const recipientScope = document.getElementById('recipientScope').value.trim(); // Get recipient scope
    const recipientSearchText = document.getElementById('recipientSearchText')?.value || ""; // Get recipient search text
    const awardType = document.getElementById('awardType').value; // Get award type
    let startDate = document.getElementById('startDate').value; // Get start date
    let endDate = document.getElementById('endDate').value; // Get end date
    const dateType = document.getElementById('dateType').value; // Get date type

    // Apply default dates if start or end date is not provided
    if (!startDate || !endDate) {
        const defaultDates = getDefaultDates();
        startDate = startDate || defaultDates.startDate;
        endDate = endDate || defaultDates.endDate;
    }

    const filters = {}; // Initialize filters object

    // Add keyword filter
    if (keyword) filters.keywords = [keyword];

    // Add award type codes filter (REQUIRED FIELD)
    if (awardType === "all_contracts") {
        filters.award_type_codes = ["A", "B", "C", "D"];
    } else if (awardType === "all_idvs") {
        filters.award_type_codes = ["IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"];
    } else if (awardType === "all_grants") {
        filters.award_type_codes = ["02", "03", "04", "05"];
    } else if (["A", "B", "C", "D", "02", "03", "04", "05", "IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"].includes(awardType)) {
        filters.award_type_codes = [awardType];
    } else {
        filters.award_type_codes = ["A", "B", "C", "D"]; // Default
        console.warn("No awardType selected; defaulting to ['A', 'B', 'C', 'D']");
    }

    // Add time period filter
    if (startDate && endDate) {
        filters.time_period = [
            { start_date: startDate, end_date: endDate, ...(dateType && { date_type: dateType }) },
        ];
    }

    // Add agency filters - OLD
    if (agencyType && subAgencyType && agencyDetails) {
        filters.agencies = [
            {
                type: agencyDetails,//awarding or fudning
                tier: "subtier",//toptier or subtier level
                name: subAgencyType,// sub agency name
                //toptier_name: agencyType, //toptier agency name
            },
        ];
    } else if  (agencyType && subAgencyType) {
        filters.agencies = [
            {
                type: "awarding",//awarding or fudning
                tier: "subtier",//toptier or subtier level
                name: subAgencyType,// sub agency name
                //toptier_name: agencyType, //toptier agency name
            },
        ];
    }  else if  (agencyType && agencyDetails) {
        filters.agencies = [
            {
                type: agencyDetails,//awarding or fudning
                tier: "toptier",//toptier or subtier level
                name: agencyType,// sub agency name
                toptier_name: agencyType, //toptier agency name
            },
        ];
    }	else if  (agencyType) {
        filters.agencies = [
            {
                type: "awarding",//awarding or fudning
                tier: "toptier",//toptier or subtier level
                name: agencyType,// sub agency name
                toptier_name: agencyType, //toptier agency name
            },
        ];
    }	else if  (subAgencyType && agencyDetails) {
        filters.agencies = [
            {
                type: agencyDetails,//awarding or fudning
                tier: "subtier",//toptier or subtier level
                name: subAgencyType,// sub agency name
                //toptier_name: agencyType, //toptier agency name
            },
        ];
    }	else if  (subAgencyType) {
        filters.agencies = [
            {
                type: "awarding",//awarding or fudning
                tier: "subtier",//toptier or subtier level
                name: subAgencyType,// sub agency name
                //toptier_name: agencyType, //toptier agency name
            },
        ];
    }

    // Add place of performance scope
    if (placeOfPerformanceScope) filters.place_of_performance_scope = placeOfPerformanceScope;

    // Add recipient scope
    if (recipientScope) filters.recipient_scope = recipientScope;

    // Process recipient search text
    const recipientSearchTextArray = recipientSearchText
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    if (recipientSearchTextArray.length > 0) {
        filters.recipient_search_text = recipientSearchTextArray;
    }

    console.log("Filters Built:", filters); // Log filters for debugging
    return filters;
}

// Fetch Total Count from API
// Fetches the total record count for the given filters.
async function fetchTotalCount(filters) {
    try {
        const requestBody = { filters }; // Request body for the count endpoint
        console.log("Fetching Total Count with Request Body:", requestBody);
        // API call to the count endpoint
        const response = await fetch('/api/count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
        const errorData = await response.json();
        console.log("Award Count API Status Code:", response.status);
        console.log("Award Count API Status Text:", response.statusText);
        console.log("Award Count API Response:", response);        
        //console.log("Award Count API Status Code:", response.status);
        //console.log("Award Count API Status Text:", response.statusText);
        console.log("Award Count API Error Message:", errorData.detail);
        console.error("Award Count API Error Message:", errorData.detail);
        console.error("Award Count API Total Count API Error:", errorData);
        throw new Error("Award Count API Failed to fetch total record count");
        }

        const data = await response.json();
        console.log("Award Count API Response:", response);        
        console.log("Award Count API Status Code:", response.status);
        console.log("Award Count API Status Text:", response.statusText);
        console.log("Award Count API Total Count API Response:", data);

        // Sum up the total count from all award types
        return Object.values(data.results).reduce((sum, count) => sum + count, 0);
    } catch (error) {
        console.error("Error Fetching Award Count API Total Count:", error);
        return 0; // Return 0 if there's an error
    }
}

// Fetch Results from API
// Fetches search results from the API based on filters and pagination settings.
async function fetchResults() {
        loader.style.display = 'block'; // Show loader
        resultsContainer.style.display = 'none'; // Hide results while fetching
    const filters = buildFilters(); // Build filters from form inputs
    if (!filters) return;

    const requestBody = {
        filters,
        fields: ['Awarding Agency','Awarding Agency Code','Awarding Sub Agency', 'Awarding Sub Agency Code', 'Funding Agency', 'Funding Agency Code','Funding Sub Agency', 'Funding Sub Agency Code', 'Award ID', 'Award Amount', 'Infrastructure Outlays', 'Infrastructure Obligations', 'Description', 'Award Type','Primary Place of Performance', 'Last Modified Date', 'Base Obligation Date', 'Recipient Name', 'Recipient UEI','recipient_id','prime_award_recipient_id'], // Fields to fetch
        //fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Description', 'Award Type', 'Funding Agency'], // Fields to fetch
        limit: 10, // Number of results per page
        page: currentPage, // Current page number
    };

    try {
        // Fetch total record count
        const totalCount = await fetchTotalCount(filters);
        if (totalRecordCountElement) {
            totalRecordCountElement.textContent = `Total Records: ${totalCount}`;
        }

        // Fetch paginated results
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
           // errorMessage.textContent = errorData.detail || 'An error occurred with the Spending By Award API.';
            console.log("Spending by Award API Status Code:", response.status);
            console.log("Spending by Award API Status Text:", response.statusText);
            console.log("Spending by Award API Response:", response);        
            console.log("Spending by Award API Error Message:", errorData.detail);
            console.error("Spending by Award Error Message:", errorData.detail);
            console.error("Spending by Award API Total Count API Error:", errorData);
            throw new Error(errorMessage.textContent);
        }

        const data = await response.json();
        console.log("Spending by Award API Fetched Response:", response);
        console.log("Spending by Award API Status Code:", response.status);
        console.log("Spending by Award API Text:", response.statusText);
        console.log("Spending by Award API Fetched Results:", data);

        renderResults(data); // Render results in the table
        resultsContainer.style.display = 'block'; // Show results
    } catch (error) {
        console.error("Error Fetching the Spending by Award API:", error);
        errorMessage.textContent = error.message;
    } finally {
        loader.style.display = 'none'; // Hide loader
    }
}

// Render Results
// Populates the table with API results or displays a message if no results are found.
function renderResults(data) {
    resultsTable.innerHTML = ''; // Clear previous results
    errorMessage.textContent = ''; // Clear previous error messages

    if (data.results.length === 0) {
        const row = resultsTable.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5; // Span across all columns
        cell.textContent = 'No results found. Please try a different search.';
        //resultsContainer.style.display = 'block';
        recordInfo.textContent = '';
        nextButton.style.display = 'none';
        prevButton.style.display = 'none';
        return;
    }

    // Get agencyType from the DOM
    const agencyTypeElement = document.getElementById('agencyType');
    const agencyType = agencyTypeElement ? agencyTypeElement.value.trim() : "";

	const subAgencyTypeElement = document.getElementById('subAgencyType'); // Get the HTML element
	const subAgencyType = subAgencyTypeElement ? subAgencyTypeElement.value.trim() : ""; // Extract and trim the value
    
	const agencyDetails = document.getElementById('agencyDetails').value.trim(); // Get agency details



/*

// Populate the table with results
data.results.forEach((award) => {
    const row = resultsTable.insertRow();

    // Initialize the recipient URL with the base Recipient Name
    let recipientURL = `https://www.usaspending.gov/keyword_search/%22${encodeURIComponent(award['Recipient Name'])}%22`;

    // Append agency-related parameters if present
    const additionalFilters = [agencyType, subAgencyType]
        .filter(Boolean) // Filter out any null or undefined values
        .map(encodeURIComponent) // Encode each value
        .map(filter => `%20AND%20%22${filter}%22`) // Format each filter
        .join(""); // Combine filters into a single string

    // Append the filters to the base URL
    recipientURL += additionalFilters;

    // Add the row and populate the cells
    row.appendChild(createLinkCell(recipientURL, award['Recipient Name']));
    row.appendChild(createLinkCell(`https://www.usaspending.gov/award/${award['generated_internal_id']}`, award['Award ID']));
    row.insertCell().textContent = award['Award Type'] || 'N/A';
    row.insertCell().textContent = award['Description'] || 'N/A';
    row.insertCell().textContent = award['Award Amount'] ? `$${award['Award Amount'].toLocaleString()}` : 'N/A';
});
*/










    // Populate the table with results
    data.results.forEach((award) => {
        const row = resultsTable.insertRow();
		// Generate URL based on agencyType and subAgencyType
		let recipientURL = `https://www.usaspending.gov/keyword_search/%22${encodeURIComponent(award['Recipient Name'])}%22`;

		if (agencyType && subAgencyType && agencyDetails) {
			// If both agencyType and subAgencyType are present
			recipientURL += `%20AND%20%22${encodeURIComponent(agencyType)}%22%20AND%20%22${encodeURIComponent(subAgencyType)}%22`;
		} else if (agencyType && subAgencyType) {
			// If both agencyType and subAgencyType are present
			recipientURL += `%20AND%20%22${encodeURIComponent(agencyType)}%22%20AND%20%22${encodeURIComponent(subAgencyType)}%22`;
		} else if (agencyType) {
			// If only agencyType is present
			recipientURL += `%20AND%20%22${encodeURIComponent(agencyType)}%22`;
		} else if (subAgencyType) {
			// If only subAgencyType is present
			recipientURL += `%20AND%20%22${encodeURIComponent(subAgencyType)}%22`;
		}
		else {
			recipientURL = `https://www.usaspending.gov/keyword_search/%22${encodeURIComponent(award['Recipient Name'])}%22`;
		}

// Log or use the recipientURL
//console.log("Generated Recipient URL:", recipientURL);


        // Append cells to the row
        row.appendChild(createLinkCell(recipientURL, award['Recipient Name']));
        row.appendChild(createLinkCell(`https://www.usaspending.gov/award/${award['generated_internal_id']}`, award['Award ID']));
        row.insertCell().textContent = award['Award Type'] || 'N/A';
        row.insertCell().textContent = award['Description'] || 'N/A';
        row.insertCell().textContent = award['Award Amount'] ? `$${award['Award Amount'].toLocaleString()}` : 'N/A';
    });

    handlePagination(data); // Update pagination controls and record info
}



// Create Link Cell Helper
// Creates a table cell containing a hyperlink or fallback text.
function createLinkCell(href, text, fallback = 'N/A') {
    const cell = document.createElement('td');
    if (href && text) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        cell.appendChild(link);
    } else {
        cell.textContent = fallback;
    }
    return cell;
}

// Handle Pagination and Display Record Info
function handlePagination(data) {
    const { hasNext = false, page = 1 } = data.page_metadata || {}; // Extract pagination metadata from the response
    const limit = 10; // Number of records per page
    const startRecord = (page - 1) * limit + 1; // Calculate the starting record number
    const endRecord = hasNext ? startRecord + limit - 1 : startRecord + data.results.length - 1; // Calculate the ending record number

    // Update record info element with current page and record range
    recordInfo.textContent = `Showing records ${startRecord} to ${endRecord} on page ${page}`; 

    prevButton.disabled = page === 1; // Disable the Previous button if on the first page
    nextButton.disabled = !hasNext; // Disable the Next button if there is no next page

    prevButton.style.display = page === 1 ? 'none' : 'block'; // Hide Previous button on page 1
    nextButton.style.display = hasNext ? 'block' : 'none'; // Hide Next button if hasNext is false
}

// For testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildFilters, getDefaultDates, createLinkCell, handlePagination, renderResults, fetchTotalCount, fetchResults };
}
