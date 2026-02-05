// Copyright Protection Utilities
// This file implements technical measures to protect intellectual property

export class CopyrightProtection {
  private static instance: CopyrightProtection;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): CopyrightProtection {
    if (!CopyrightProtection.instance) {
      CopyrightProtection.instance = new CopyrightProtection();
    }
    return CopyrightProtection.instance;
  }

  // Initialize copyright protection
  public initialize(): void {
    if (this.isInitialized) return;

    this.addCopyrightNotice();
    this.addProfessionalCopyright();
    this.protectSourceCode();

    this.isInitialized = true;
  }

  // Add copyright notice to console (disabled by default)
  private addCopyrightNotice(): void {
    // Copyright notice disabled - no console output
    // Uncomment the following code and set VITE_ENABLE_COPYRIGHT=true to enable
    /*
    const copyrightText = `
╔══════════════════════════════════════════════════════════════╗
║                    COPYRIGHT NOTICE                          ║
║                                                              ║
║  © 2024 Islamic Dataset Interface. All rights reserved.     ║
║                                                              ║
║  This application is protected by copyright laws and         ║
║  international treaties. Unauthorized reproduction,          ║
║  distribution, or modification is strictly prohibited.       ║
║                                                              ║
  ║  For licensing inquiries: begumsabina81193@gmail.com        ║
╚══════════════════════════════════════════════════════════════╝
    `;

    // eslint-disable-next-line no-console
    console.log(copyrightText);
    */
  }

  // Add professional copyright notice (without blocking tools)
  private addProfessionalCopyright(): void {
    // Only add console notice, don't block tools
    this.addConsoleWarning();

    // Add subtle watermark for branding
    this.addWatermark();
  }

  // Add professional copyright notice to console (disabled by default)
  private addConsoleWarning(): void {
    // Copyright notice disabled - no console output
    // Uncomment the following code and set VITE_ENABLE_COPYRIGHT=true to enable
    /*
    const notice = `
📚 Islamic Dataset Interface - Copyright Notice

This application is protected by copyright laws.
For licensing inquiries or legitimate development purposes,
please contact: begumsabina81193@gmail.com

Thank you for respecting intellectual property rights.
    `;

    // eslint-disable-next-line no-console
    console.log(notice);
    */
  }

  // Protect source code visibility
  private protectSourceCode(): void {
    // Disable text selection on critical elements
    const criticalElements = document.querySelectorAll(".copyright-protected");
    criticalElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.userSelect = "none";
    });

    // Add protection to images and assets
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      img.addEventListener("contextmenu", (e) => e.preventDefault());
      img.addEventListener("dragstart", (e) => e.preventDefault());
    });
  }

  // Add invisible watermark
  private addWatermark(): void {
    const watermark = document.createElement("div");
    // Use textContent instead of innerHTML for Trusted Types compatibility
    watermark.textContent = "© 2024 Islamic Dataset Interface";
    watermark.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 24px;
      color: rgba(0, 0, 0, 0.02);
      pointer-events: none;
      z-index: -1;
      user-select: none;
      white-space: nowrap;
    `;
    document.body.appendChild(watermark);
  }

  // Verify application integrity
  public verifyIntegrity(): boolean {
    // In a real implementation, you would check file hashes
    // For now, we'll just return true
    return true;
  }

  // Get copyright information
  public getCopyrightInfo(): object {
    return {
      year: new Date().getFullYear(),
      owner: "Islamic Dataset Interface",
      rights: "All rights reserved",
      contact: "begumsabina81193@gmail.com",
      version: "1.0.0",
      protectionLevel: "High",
    };
  }
}

// Initialize copyright protection when the module is loaded
// Only initialize if explicitly enabled via environment variable
const copyrightProtection = CopyrightProtection.getInstance();

// Only initialize if explicitly enabled
if (import.meta.env.VITE_ENABLE_COPYRIGHT === "true") {
  copyrightProtection.initialize();
}

export default copyrightProtection;
