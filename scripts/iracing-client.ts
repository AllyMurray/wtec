
interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  authcode: string;
  autoLoginSeries: null | string;
  autoLoginToken: null | string;
  custId: number;
  email: string;
  ssoCookieDomain: string;
  ssoCookieName: string;
  ssoCookiePath: string;
  ssoCookieValue: string;
}

interface S3Response {
  link: string;
  expires: string;
}

/**
 * @example
 * ```typescript
 * const client = new IRacingClient({
 *   email: 'your-email@example.com',
 *   password: 'your-password'
 * });
 *
 * try {
 *   // Get league data
 *   const response = await client.makeAuthorizedRequest('/data/league/get', {
 *     league_id: 7058,
 *     include_license: true
 *   });
 *   const data = await response.json();
 *   console.log(data);
 *
 *   // Get member data
 *   const memberResponse = await client.makeAuthorizedRequest('/data/member/get', {
 *     cust_id: client.getCustomerId()
 *   });
 *   const memberData = await memberResponse.json();
 *   console.log(memberData);
 * } catch (error) {
 *   console.error('API error:', error);
 * }
 * ```
 */
export class IRacingClient {
  private baseUrl = 'https://members-ng.iracing.com';
  private authData: AuthResponse | null = null;
  private cookies: Record<string, string> | null = null;
  private email: string;
  private password: string;

  constructor(config: { email: string; password: string }) {
    this.email = config.email;
    this.password = config.password;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.authData) {
      await this.authenticate();
    }
  }

  private async authenticate(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: this.email, password: this.password }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const authData = await response.json();
    this.authData = authData;

    // Parse and store cookies
    this.cookies = {
      'irsso_membersv2': authData.ssoCookieValue,
      'authtoken_members': `%7B%22authtoken%22%3A%7B%22authcode%22%3A%22${authData.authcode}%22%2C%22email%22%3A%22${encodeURIComponent(authData.email)}%22%7D%7D`
    };

    console.log("🚀 ~ IRacingClient ~ auth response:", authData);
  }

  async makeAuthorizedRequest<T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    options: RequestInit = {}
  ): Promise<T> {
    await this.ensureAuthenticated();

    const headers = new Headers(options.headers);

    if (!this.cookies) {
      throw new Error('Cookies not initialized');
    }

    // Set all cookies in the Cookie header
    const cookieString = Object.entries(this.cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');

    headers.set('Cookie', cookieString);

    console.log("🚀 ~ IRacingClient ~ cookieString:", cookieString);

    const response = await fetch(this.buildUrl(endpoint, params), {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const s3Data: S3Response = await response.json();

    // Fetch the actual data from the S3 bucket
    const dataResponse = await fetch(s3Data.link);
    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch data from S3: ${dataResponse.statusText}`);
    }

    return dataResponse.json();
  }

  isAuthenticated(): boolean {
    return this.authData !== null;
  }

  getCustomerId(): number | null {
    return this.authData?.custId ?? null;
  }
}



