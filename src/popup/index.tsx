import { useState, useEffect } from "react"
// Import functions directly, not the non-existent class
import { getJiraPatterns, checkUrlMatch } from "../services/storage"
import type { JiraPattern } from "../services/storage"

function IndexPopup() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [isJiraUrl, setIsJiraUrl] = useState(false)
  const [matchingPattern, setMatchingPattern] = useState<JiraPattern | null>(null)
  const [allJiraPatterns, setAllJiraPatterns] = useState<JiraPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Fetch patterns using the imported function
    const fetchPatterns = getJiraPatterns()
    // Fetch tab info
    const fetchTabInfo = chrome.tabs.query({ active: true, currentWindow: true })

    Promise.all([fetchPatterns, fetchTabInfo]).then(([patterns, tabs]) => {
      setAllJiraPatterns(patterns) // Store all fetched patterns

      const currentTab = tabs[0]
      if (currentTab?.url) {
        const url = currentTab.url
        setCurrentUrl(url)

        // Check match using the imported function
        checkUrlMatch(url).then(match => {
          if (match) {
            setIsJiraUrl(true)
            setMatchingPattern(match)
          } else {
            setIsJiraUrl(false)
            setMatchingPattern(null)
          }
          setLoading(false) // Set loading false after check completes
        }).catch(checkError => {
          // Handle error specific to checkUrlMatch if needed
          console.error("Error checking URL match:", checkError);
          setError("Error checking URL match.");
          setLoading(false);
        })

      } else {
        setCurrentUrl("(No URL found for current tab)")
        setIsJiraUrl(false)
        setMatchingPattern(null)
        setLoading(false) // Set loading false if no URL
      }

    }).catch(initialError => {
      console.error("Error fetching initial data:", initialError)
      setError("Error fetching patterns or tab info. See console.")
      setCurrentUrl("")
      setIsJiraUrl(false)
      setMatchingPattern(null)
      setAllJiraPatterns([])
      setLoading(false)
    })
  }, [])

  // Helper to check if a specific pattern object matches the current URL
  // This can still be useful for filtering the displayed list locally
  const checkMatchLocal = (patternObj: JiraPattern): boolean => {
    if (!currentUrl) return false;
    try {
      const regex = new RegExp(patternObj.pattern);
      return regex.test(currentUrl);
    } catch (e) {
      // Log error for invalid regex encountered during local filtering
      // console.warn(`Invalid regex encountered during display filter: ${patternObj.pattern}`);
      return false;
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
    const matchingStoredPatterns = allJiraPatterns.filter(checkMatchLocal);

    content = (
      <>
        {isJiraUrl && matchingPattern ? (
          <>
            <h2>Matched JIRA Pattern:</h2>
            {/* Display matched pattern details */}
            <div style={{ padding: "4px 0", marginBottom: '10px' }}>
              <div style={{ fontWeight: "bold", fontFamily: 'monospace' }}>{matchingPattern.pattern}</div>
              {matchingPattern.description && (
                <div style={{ fontSize: '0.9em', color: '#555' }}>{matchingPattern.description}</div>
              )}
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
              {matchingStoredPatterns.map((jp, index) => (
                <li key={index} style={{ padding: '3px 0', fontFamily: 'monospace', fontSize: '0.9em' }}>
                  <span>{jp.pattern}</span>
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

        {/* Display all stored patterns, regardless of match status */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <h2>All Stored JIRA Patterns ({allJiraPatterns.length}):</h2>
          {allJiraPatterns.length > 0 ? (
             <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '5px' }}>
               {allJiraPatterns.map((jp, index) => (
                 <li key={index} style={{ padding: '3px 0', fontFamily: 'monospace', fontSize: '0.9em' }}>
                   <span>{jp.pattern}</span>
                   {jp.description && <span style={{ fontSize: '0.9em', color: '#555', marginLeft: '10px' }}>({jp.description})</span>}
                 </li>
               ))}
             </ul>
           ) : (
            <p style={{ fontStyle: 'italic', fontSize: '0.9em' }}>No patterns stored.</p>
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
      {content}
    </div>
  )
}

export default IndexPopup