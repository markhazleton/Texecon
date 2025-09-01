interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: string;
}

interface ContentValidationConfig {
  validateImages?: boolean;
  validateLinks?: boolean;
  validateContent?: boolean;
  timeoutMs?: number;
}

class ContentValidator {
  private config: ContentValidationConfig;

  constructor(config: ContentValidationConfig = {}) {
    this.config = {
      validateImages: true,
      validateLinks: true,
      validateContent: true,
      timeoutMs: 5000,
      ...config
    };
  }

  async validateContent(data: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const timestamp = new Date().toISOString();

    try {
      // Validate basic structure
      if (!data || typeof data !== 'object') {
        errors.push('Content data is missing or invalid');
        return { isValid: false, errors, warnings, timestamp };
      }

      // Validate required fields
      await this.validateRequiredFields(data, errors, warnings);
      
      // Validate images if enabled
      if (this.config.validateImages) {
        await this.validateImages(data, errors, warnings);
      }

      // Validate links if enabled
      if (this.config.validateLinks) {
        await this.validateLinks(data, errors, warnings);
      }

      // Validate content structure
      if (this.config.validateContent) {
        await this.validateContentStructure(data, errors, warnings);
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp
    };
  }

  private async validateRequiredFields(data: any, errors: string[], warnings: string[]): Promise<void> {
    // Check metadata
    if (!data.metadata) {
      errors.push('Missing metadata section');
    } else {
      if (!data.metadata.title) errors.push('Missing metadata title');
      if (!data.metadata.description) errors.push('Missing metadata description');
      if (!data.metadata.lastUpdated) warnings.push('Missing lastUpdated timestamp');
    }

    // Check team members
    if (!data.team || !Array.isArray(data.team)) {
      errors.push('Missing or invalid team section');
    } else {
      data.team.forEach((member: any, index: number) => {
        if (!member.name) errors.push(`Team member ${index + 1} missing name`);
        if (!member.title) errors.push(`Team member ${index + 1} missing title`);
        if (!member.description) warnings.push(`Team member ${index + 1} missing description`);
        if (!member.image) warnings.push(`Team member ${index + 1} missing image`);
      });
    }

    // Check navigation
    if (!data.navigation || !Array.isArray(data.navigation)) {
      errors.push('Missing or invalid navigation section');
    } else if (data.navigation.length === 0) {
      warnings.push('Navigation is empty');
    }
  }

  private async validateImages(data: any, errors: string[], warnings: string[]): Promise<void> {
    const imageUrls: string[] = [];
    
    // Collect image URLs from various sections
    if (data.team) {
      data.team.forEach((member: any) => {
        if (member.image) imageUrls.push(member.image);
      });
    }
    
    if (data.insights) {
      data.insights.forEach((insight: any) => {
        if (insight.image) imageUrls.push(insight.image);
      });
    }

    // Validate each image URL
    for (const imageUrl of imageUrls) {
      try {
        const response = await fetch(imageUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(this.config.timeoutMs || 5000)
        });
        
        if (!response.ok) {
          errors.push(`Image not accessible: ${imageUrl} (${response.status})`);
        } else if (!response.headers.get('content-type')?.startsWith('image/')) {
          warnings.push(`URL may not be an image: ${imageUrl}`);
        }
      } catch (error) {
        warnings.push(`Could not validate image: ${imageUrl}`);
      }
    }
  }

  private async validateLinks(data: any, errors: string[], warnings: string[]): Promise<void> {
    const links: string[] = [];
    
    // Collect links from team social profiles
    if (data.team) {
      data.team.forEach((member: any) => {
        if (member.social) {
          Object.values(member.social).forEach((url: any) => {
            if (url && typeof url === 'string' && url !== '#') {
              links.push(url);
            }
          });
        }
      });
    }

    // Validate external links
    for (const link of links) {
      if (link.startsWith('http')) {
        try {
          const response = await fetch(link, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(this.config.timeoutMs || 5000)
          });
          
          if (!response.ok) {
            warnings.push(`External link may be broken: ${link} (${response.status})`);
          }
        } catch (error) {
          warnings.push(`Could not validate link: ${link}`);
        }
      }
    }
  }

  private async validateContentStructure(data: any, errors: string[], warnings: string[]): Promise<void> {
    // Check for empty content
    if (data.navigation) {
      data.navigation.forEach((item: any, index: number) => {
        if (!item.title || item.title.trim() === '') {
          errors.push(`Navigation item ${index + 1} has empty title`);
        }
        if (!item.content || item.content.trim() === '') {
          warnings.push(`Navigation item ${index + 1} has no content`);
        }
      });
    }

    // Check for broken HTML in content
    if (data.navigation) {
      data.navigation.forEach((item: any, index: number) => {
        if (item.content && typeof item.content === 'string') {
          const openTags = (item.content.match(/<[^/][^>]*>/g) || []).length;
          const closeTags = (item.content.match(/<\/[^>]*>/g) || []).length;
          
          if (openTags !== closeTags) {
            warnings.push(`Navigation item ${index + 1} may have unmatched HTML tags`);
          }
        }
      });
    }
  }

  // Validate content freshness
  async validateFreshness(data: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const timestamp = new Date().toISOString();

    if (data.metadata?.lastUpdated) {
      const lastUpdate = new Date(data.metadata.lastUpdated);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 30) {
        warnings.push(`Content hasn't been updated in ${Math.floor(daysSinceUpdate)} days`);
      } else if (daysSinceUpdate > 7) {
        warnings.push(`Content is ${Math.floor(daysSinceUpdate)} days old`);
      }
    } else {
      warnings.push('No last updated timestamp found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp
    };
  }
}

export default ContentValidator;
export type { ValidationResult, ContentValidationConfig };