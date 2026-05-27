import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import Colors from "../configs/Colors";

interface RenderHtmlProps {
  content: string;
  style?: any;
  collapsedLines?: number;
}

const RenderHtml: React.FC<RenderHtmlProps> = ({
  content,
  style,
  collapsedLines = 4,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [webViewHeight, setWebViewHeight] = useState(200);

  // Return empty view if no content
  if (!content || content.trim() === "" || content === "<p></p>") {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={styles.emptyText}>No content to display</Text>
      </View>
    );
  }

  // Auto-detect content type (matching your web version)
  const isHtmlContent = (str: string): boolean => {
    // Check for HTML tags (but not just simple markdown)
    // Require actual HTML-like tags with closing '>' and not just angle brackets
    // Avoid matching tags that include obvious event handlers or scripts
    const htmlTagPattern =
      /<\s*(?:p|div|span|strong|em|ul|ol|li|br|h[1-6]|blockquote|code)\b[^>]*>/i;
    return htmlTagPattern.test(str);
  };

  // Automatically determine which renderer to use
  const shouldUseRichText = isHtmlContent(content);

  // Rich text renderer (for HTML content) - using WebView
  if (shouldUseRichText) {
    // Process content to handle checkmarks on new lines
    const processContent = (htmlContent: string): string => {
      // Simple approach: replace space + checkmark with line break + checkmark
      // This will put each checkmark on its own line
      return htmlContent
        .replace(/(\s+)✅/g, "<br/>✅")
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
        .replace(/javascript:/gi, ""); // Remove javascript links
    };

    const processedContent = processContent(content);

    // Create HTML wrapper with comprehensive styling (matching your web styles)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
              margin: 0;
              background-color: transparent;
            }
            
            /* Rich text renderer styles - matching your web editor */
            .prose ul {
              list-style-type: disc !important;
              padding-left: 20px !important;
              margin: 12px 0 !important;
            }
            .prose ol {
              list-style-type: decimal !important;
              padding-left: 20px !important;
              margin: 12px 0 !important;
            }
            .prose li {
              display: list-item !important;
              margin-left: 0 !important;
              padding-left: 4px !important;
              margin-bottom: 4px !important;
            }
            .prose ul li::marker {
              color: #6b7280 !important;
            }
            .prose ol li::marker {
              color: #6b7280 !important;
            }
            
            ul {
              list-style-type: disc !important;
              padding-left: 20px !important;
              margin: 12px 0 !important;
            }
            ol {
              list-style-type: decimal !important;
              padding-left: 20px !important;
              margin: 12px 0 !important;
            }
            li {
              display: list-item !important;
              margin-bottom: 4px !important;
            }
            
            p {
              margin: 0 0 1em 0 !important;
            }
            
            p:last-child {
              margin-bottom: 0 !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
              color: #1f2937;
              font-weight: 600 !important;
              line-height: 1.25 !important;
              margin: 1rem 0 0.5rem 0 !important;
            }
            
            h1:first-child, h2:first-child, h3:first-child {
              margin-top: 0 !important;
            }
            
            h1 { font-size: 0.875rem !important; } /* text-sm */
            h2 { font-size: 1rem !important; } /* text-base */
            h3 { font-size: 1.125rem !important; } /* text-lg */
            
            strong, b {
              font-weight: 600 !important;
              color: #1f2937;
            }
            
            em, i {
              font-style: italic !important;
            }
            
            a {
              color: #2563eb !important;
              text-decoration: underline;
            }
            
            a:hover {
              color: #1d4ed8 !important;
            }
            
            code {
              background-color: #f1f5f9 !important;
              padding: 2px 4px !important;
              border-radius: 3px !important;
              font-size: 0.875em !important;
              color: #374151 !important;
              font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
            }
            
            del, s {
              text-decoration: line-through;
              color: #6b7280 !important;
            }
            
            blockquote {
              border-left: 4px solid #e5e7eb !important;
              padding-left: 1em !important;
              margin: 1.5em 0 !important;
              color: #6b7280 !important;
              font-style: italic !important;
            }
            
            img {
              max-width: 100%;
              height: auto;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            
            hr {
              border: none;
              border-top: 1px solid #e5e7eb;
              margin: 16px 0;
            }
          </style>
        </head>
        <body class="prose">
          ${processedContent}
          <script>
            // Auto-resize functionality
            function updateHeight() {
              const height = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
              );
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'resize',
                height: height
              }));
            }
            
            // Update height when content loads
            window.addEventListener('load', updateHeight);
            setTimeout(updateHeight, 100);
            setTimeout(updateHeight, 500);
            setTimeout(updateHeight, 1000);
            
            // Handle link clicks
            document.addEventListener('click', function(e) {
              if (e.target.tagName === 'A') {
                e.preventDefault();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'link',
                  url: e.target.href
                }));
              }
            });
          </script>
        </body>
      </html>
    `;

    const collapsedHeight = collapsedLines * 24; // Approximate line height
    const displayHeight = isExpanded
      ? webViewHeight
      : Math.min(webViewHeight, collapsedHeight);
    const needsExpansion = webViewHeight > collapsedHeight;

    return (
      <View style={[styles.container, style]}>
        <View style={[styles.webViewContainer, { height: displayHeight }]}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={styles.webView}
            scrollEnabled={isExpanded}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onShouldStartLoadWithRequest={(request) => {
              // Handle external links
              if (
                request.url !== "about:blank" &&
                !request.url.startsWith("data:")
              ) {
                Linking.openURL(request.url).catch(() => {
                  Alert.alert("Error", "Could not open link");
                });
                return false;
              }
              return true;
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "link") {
                  Linking.openURL(data.url).catch(() => {
                    Alert.alert("Error", "Could not open link");
                  });
                } else if (data.type === "resize") {
                  setWebViewHeight(data.height);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }}
          />

          {/* Overlay gradient for collapsed content */}
          {needsExpansion && !isExpanded && (
            <View style={styles.fadeOverlay} pointerEvents="none" />
          )}
        </View>

        {needsExpansion && (
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.seeMoreText}>
              {isExpanded ? "See Less" : "See More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Original markdown renderer (for legacy markdown content)
  const convertMarkdownToText = (markdown: string): string => {
    return markdown
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/`(.*?)`/g, "$1") // Remove code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
      .replace(/\n\n+/g, "\n") // Reduce multiple line breaks
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/&amp;/g, "&") // Replace HTML entities
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  };

  // Simple text renderer for markdown content
  const textContent = convertMarkdownToText(content);
  const lines = textContent.split("\n").filter((line) => line.trim() !== "");

  // Determine if we need "See More" functionality
  const needsExpansion = lines.length > collapsedLines;
  const displayLines = isExpanded ? lines : lines.slice(0, collapsedLines);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        {displayLines.map((line, index) => (
          <Text key={index} style={styles.textContent}>
            {line}
          </Text>
        ))}

        {needsExpansion && (
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.seeMoreText}>
              {isExpanded ? "See Less" : "See More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base container
  },
  emptyContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    // padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "left",
  },
  webViewContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  webView: {
    backgroundColor: "transparent",
    flex: 1,
  },
  fadeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    // Simple fade effect using backgroundColor
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  textContainer: {
    // Text container for markdown content
  },
  textContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    textAlign: "left",
    // marginBottom: 8,
  },
  seeMoreButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default RenderHtml;
export { RenderHtml as HtmlRenderer };
