import { useState, useEffect } from "react"

// Define the structure for a JIRA pattern
interface JiraPattern {
  pattern: string;
  description: string;
}

function IndexPopup() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [isJiraUrl, setIsJiraUrl] = useState(false)
  const [matchingPattern, setMatchingPattern] = useState<JiraPattern | null>(null) // Use JiraPattern type
  const [allJiraPatterns, setAllJiraPatterns] = useState<JiraPattern[]>([]) // Use JiraPattern[] type
  const [loading, setLoading] = useState(true) // Added loading state
  const [error, setError] = useState<string | null>(null) // Added error state

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Fetch stored JIRA patterns and the current tab URL concurrently
    Promise.all([
      chrome.storage.local.get({ jiraPatterns: [] as JiraPattern[] }),
      chrome.tabs.query({ active: true, currentWindow: true })
    ]).then(([{ jiraPatterns }, tabs]) => {
      setAllJiraPatterns(jiraPatterns)

      const currentTab = tabs[0]
      if (currentTab?.url) {
        const url = currentTab.url
        setCurrentUrl(url)

        // Find the first pattern object whose regex matches the URL
        const foundPatternObject = jiraPatterns.find(jp => {
          try {
            // Create RegExp from the pattern string
            const regex = new RegExp(jp.pattern)
            // Test against the current URL
            return regex.test(url)
          } catch (e) {
            console.error(`Invalid regex pattern: ${jp.pattern}`, e)
            return false // Treat invalid regex as non-matching
          }
        })

        if (foundPatternObject) {
          setIsJiraUrl(true)
          setMatchingPattern(foundPatternObject) // Store the whole object
        } else {
          setIsJiraUrl(false)
          setMatchingPattern(null)
        }
      } else {
          setCurrentUrl("(No URL found for current tab)")
      }
      setLoading(false)
    }).catch(error => {
      console.error("Error fetching data:", error)
      setError("Error fetching data. See console for details.")
      setCurrentUrl("")
      setIsJiraUrl(false)
      setMatchingPattern(null)
      setAllJiraPatterns([])
      setLoading(false)
    })
  }, [])

  // Helper to check if a specific pattern object matches the current URL
  const checkMatch = (patternObj: JiraPattern): boolean => {
    if (!currentUrl) return false;
    try {
      const regex = new RegExp(patternObj.pattern);
      return regex.test(currentUrl);
    } catch (e) {
      return false; // Invalid regex won't match
    }
  };

  // Determine content based on loading, error, and pattern status
  let content;
  if (loading) {
    content = <h2>Loading...</h2>;
  } else if (error) {
    content = <h2 style={{ color: 'red' }}>{error}</h2>;
  } else if (allJiraPatterns.length === 0) {
    content = <h2>No JIRA URL patterns stored in settings.</h2>;
  } else {
    // Content when patterns exist
    const matchingStoredPatterns = allJiraPatterns.filter(checkMatch);

    content = (
      <>
        {isJiraUrl && matchingPattern ? (
          <>
            <h2>Matched JIRA Pattern:</h2>
            {/* Display matched pattern details */}
            <div style={{ padding: "4px 0", marginBottom: '10px' }}>
              <div style={{ fontWeight: "bold", fontFamily: 'monospace' }}>{matchingPattern.pattern}</div>
              <div style={{ fontSize: '0.9em', color: '#555' }}>{matchingPattern.description}</div>
            </div>
            <h2>Full URL:</h2>
            <div style={{ wordBreak: "break-all", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              {currentUrl}
            </div>
          </>
        ) : (
          <h2>{currentUrl ? "No matching JIRA pattern found for this page." : "Checking..."}</h2>
        )}

        {/* Display only the stored patterns that actually match the current URL */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <h2>Matching Stored Patterns ({matchingStoredPatterns.length}):</h2>
          {matchingStoredPatterns.length > 0 ? (
            <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '5px' }}>
              {matchingStoredPatterns.map((jp, index) => ( // Iterate through filtered JiraPattern objects
                <li key={index} style={{ padding: '3px 0', fontFamily: 'monospace', fontSize: '0.9em' }}>
                  <span>{jp.pattern}</span> {/* Display the pattern string */}
                  {jp.description && <span style={{ fontSize: '0.9em', color: '#555', marginLeft: '10px' }}>({jp.description})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontStyle: 'italic', fontSize: '0.9em' }}>
              {currentUrl ? "None of the stored patterns match the current URL." : "Cannot check patterns without URL."}
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        minWidth: "450px",
        backgroundColor: "#e6f7ff"
      }}>
      {content} {/* Render the determined content */}
    </div>
  )
}

export default IndexPopup