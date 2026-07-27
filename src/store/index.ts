import {
  createUserWithEmailAndPassword,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from '@firebase/auth'
import { createStore, type Store } from 'vuex'
import type { InjectionKey } from 'vue'
import { loginWithFirebase, registerWithFirebase } from '@/api/authService'

const CRED_ERRORS: Record<string, string> = {
  'auth/invalid-email': 'auth/invalid-credentials',
  'auth/wrong-password': 'auth/invalid-credentials',
  'auth/user-not-found': 'auth/invalid-credentials',
  'auth/invalid-credential': 'auth/invalid-credentials',
  'auth/account-exists-with-different-credential': 'auth/account-exists-with-different-credential'
}

interface AppUserCredentials {
  providerId: string | null
  emailVerified: boolean | null
  displayName: string | null
  photoUrl: string | null
  uid: string | null
  email: string | null
  rawUserInfo: Record<string, unknown> | null
  jwt?: string | null
}

export interface State {
  appUserCredentials: AppUserCredentials
  lang: string
  jwt: string | null
  platformUserId: string | null
  roles: string[]
  isLogged: boolean
  isNewUser: boolean
}

export const key: InjectionKey<Store<State>> = Symbol()

export default createStore<State>({
  state: {
    appUserCredentials: {
      providerId: null,
      emailVerified: null,
      displayName: null,
      photoUrl: null,
      uid: null,
      email: null,
      rawUserInfo: null
    },
    lang: localStorage.getItem('lang') || (navigator.language.startsWith('es') ? 'es' : 'en'),
    jwt: localStorage.getItem('vitrina_jwt') || null,
    platformUserId: localStorage.getItem('vitrina_userId') || null,
    roles: (() => {
      try {
        return JSON.parse(localStorage.getItem('vitrina_roles') || '[]') as string[]
      } catch {
        return []
      }
    })(),
    isLogged: false,
    isNewUser: false
  },
  mutations: {
    mutateLang(state, payload: string) {
      state.lang = payload
    },
    setIsLogged(state, payload: boolean) {
      state.isLogged = payload
    },
    setIsNewUser(state, payload: boolean) {
      state.isNewUser = payload
    },
    setJwt(state, jwt: string | null) {
      state.jwt = jwt
      state.appUserCredentials.jwt = jwt
      if (jwt) {
        localStorage.setItem('vitrina_jwt', jwt)
      } else {
        localStorage.removeItem('vitrina_jwt')
      }
    },
    setPlatformUserId(state, userId: string | null) {
      state.platformUserId = userId
      if (userId) {
        localStorage.setItem('vitrina_userId', userId)
      } else {
        localStorage.removeItem('vitrina_userId')
      }
    },
    setRoles(state, roles: string[]) {
      state.roles = roles
      localStorage.setItem('vitrina_roles', JSON.stringify(roles))
    },
    setUserCredentials(
      state,
      payload: {
        user: { uid: string; emailVerified: boolean }
        _tokenResponse: {
          providerId: string
          screenName?: string
          displayName?: string
          email?: string
          photoUrl?: string
          rawUserInfo?: string
        }
      } | null
    ) {
      if (!payload) {
        const keys = Object.keys(state.appUserCredentials) as Array<keyof AppUserCredentials>
        keys.forEach((k) => {
          ;(state.appUserCredentials as unknown as Record<string, unknown>)[k] = null
        })
        return
      }
      const { uid, emailVerified } = payload.user
      const { providerId, screenName, displayName, email, photoUrl, rawUserInfo } =
        payload._tokenResponse

      let rawUserInfoJSON: Record<string, unknown> | null = null
      if (rawUserInfo !== 'undefined' && rawUserInfo) {
        rawUserInfoJSON = JSON.parse(rawUserInfo) as Record<string, unknown>
      }
      state.appUserCredentials = {
        providerId,
        emailVerified: emailVerified || false,
        displayName: displayName || screenName || null,
        photoUrl: photoUrl || 'https://img.icons8.com/color/48/000000/firebase.png',
        uid,
        email: email ?? null,
        rawUserInfo: rawUserInfoJSON || null
      }
    }
  },
  actions: {
    // Full logout: clears Firebase session AND platform state.
    // Only call this from explicit user action (settings popup).
    async logout({ commit }) {
      const auth = getAuth()
      await signOut(auth)
      commit('setIsLogged', false)
      commit('setUserCredentials', null)
      commit('setJwt', null)
      commit('setPlatformUserId', null)
      commit('setRoles', [])
    },
    // Clears platform JWT and store state WITHOUT touching Firebase session.
    // Used by 401 interceptors and auth state handlers so Firebase can
    // re-authenticate on the next visit.
    clearPlatformSession({ commit }) {
      commit('setIsLogged', false)
      commit('setUserCredentials', null)
      commit('setJwt', null)
      commit('setPlatformUserId', null)
      commit('setRoles', [])
    },
    // Attempts to get a fresh platform JWT using the current Firebase session.
    // Returns true if successful, false otherwise.
    async refreshPlatformJwt({ commit }): Promise<boolean> {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return false
      try {
        const firebaseIdToken = await user.getIdToken(true)
        let authResponse
        try {
          authResponse = await loginWithFirebase(firebaseIdToken)
        } catch (loginError: unknown) {
          const e = loginError as { response?: { status?: number }; status?: number }
          const status = e?.response?.status ?? e?.status
          if (status === 401 || status === 404) {
            authResponse = await registerWithFirebase(firebaseIdToken)
          } else {
            throw loginError
          }
        }
        commit('setJwt', authResponse.access_token)
        commit('setPlatformUserId', authResponse.user.id)
        commit('setRoles', authResponse.user.roles)
        commit('setIsLogged', true)
        return true
      } catch (error) {
        console.warn('[store] Platform JWT refresh failed.', error)
        return false
      }
    },
    async login(
      { commit },
      { provider, email, password }: { provider: string; email?: string; password?: string }
    ) {
      const auth = getAuth()
      let credentials = null
      switch (provider) {
        case 'google':
          try {
            credentials = await signInWithPopup(auth, new GoogleAuthProvider())
            if (!credentials.user.emailVerified) {
              try {
                await sendEmailVerification(auth.currentUser!)
              } catch (_) {
                /* non-blocking */
              }
            }
          } catch (error: unknown) {
            const e = error as { code?: string; message?: string }
            const mapped = e.code ? CRED_ERRORS[e.code] : undefined
            throw Object.assign(new Error(mapped ?? e.message), { code: mapped ?? e.code })
          }
          break
        case 'github':
          try {
            credentials = await signInWithPopup(auth, new GithubAuthProvider())
            if (!credentials.user.emailVerified) {
              try {
                await sendEmailVerification(auth.currentUser!)
              } catch (_) {
                /* non-blocking */
              }
            }
          } catch (error: unknown) {
            const e = error as { code?: string; message?: string }
            const mapped = e.code ? CRED_ERRORS[e.code] : undefined
            throw Object.assign(new Error(mapped ?? e.message), { code: mapped ?? e.code })
          }
          break
        default:
          try {
            credentials = await signInWithEmailAndPassword(auth, email!, password!)
            if (!credentials.user.emailVerified) {
              try {
                await sendEmailVerification(auth.currentUser!)
              } catch (_) {
                /* non-blocking */
              }
            }
          } catch (error: unknown) {
            const e = error as { code?: string; message?: string }
            const mapped = e.code ? CRED_ERRORS[e.code] : undefined
            throw Object.assign(new Error(mapped ?? e.message), { code: mapped ?? e.code })
          }
          break
      }

      const cred = credentials!
      commit('setUserCredentials', cred)

      try {
        const firebaseIdToken = await cred.user.getIdToken()
        let authResponse
        try {
          authResponse = await loginWithFirebase(firebaseIdToken)
        } catch (loginError: unknown) {
          const e = loginError as { response?: { status?: number }; status?: number }
          const status = e?.response?.status ?? e?.status
          if (status === 401 || status === 404) {
            authResponse = await registerWithFirebase(firebaseIdToken)
          } else {
            throw loginError
          }
        }
        commit('setJwt', authResponse.access_token)
        commit('setPlatformUserId', authResponse.user.id)
        commit('setRoles', authResponse.user.roles)
        commit('setIsNewUser', authResponse.isNewUser)
        commit('setIsLogged', true)
      } catch (error) {
        console.warn('[store] Platform JWT exchange failed.', error)
      }
    },
    async reset(_, { email }: { email: string }) {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
    },
    async signup(
      { commit },
      { username, email, password }: { username: string; email: string; password: string }
    ) {
      const auth = getAuth()
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        try {
          await sendEmailVerification(auth.currentUser!)
        } catch (error) {
          console.warn('[store] Failed to send email verification:', error)
        }
        try {
          await updateProfile(auth.currentUser!, { displayName: username })
          commit('setUserCredentials', {
            user: { uid: userCred.user.uid, emailVerified: userCred.user.emailVerified },
            _tokenResponse: {
              displayName: username,
              photoUrl: null,
              email: userCred.user.email,
              providerId: 'password'
            }
          })
        } catch (error) {
          console.error('[store] Failed to update Firebase display name:', error)
        }
        try {
          const firebaseIdToken = await userCred.user.getIdToken()
          let authResponse
          try {
            authResponse = await registerWithFirebase(firebaseIdToken)
          } catch (registerError: unknown) {
            const e = registerError as { response?: { status?: number }; status?: number }
            const status = e?.response?.status ?? e?.status
            if (status === 409) {
              authResponse = await loginWithFirebase(firebaseIdToken)
            } else {
              throw registerError
            }
          }
          commit('setJwt', authResponse.access_token)
          commit('setPlatformUserId', authResponse.user.id)
          commit('setRoles', authResponse.user.roles)
          commit('setIsNewUser', authResponse.isNewUser)
          commit('setIsLogged', true)
        } catch (error) {
          console.warn('[store] Platform JWT registration failed.', error)
        }
      } catch (error) {
        throw error
      }
    },
    async initLogin({ commit, dispatch }) {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      let token: string | null = null
      try {
        token = await user.getIdToken()
      } catch {
        /* Token retrieval failed */
      }
      if (!token) return

      const tokenPayload = token.split('.')[1] ?? ''
      let currentProvider: string
      try {
        const decoded = JSON.parse(atob(tokenPayload)) as { firebase: { sign_in_provider: string } }
        currentProvider = decoded.firebase.sign_in_provider
      } catch {
        return
      }

      const { uid, emailVerified } = user
      const providerData = user.providerData.find(
        (element) => element.providerId === currentProvider
      )
      const { displayName, photoURL: photoUrl, email } = providerData || {}
      const screenName = (user as unknown as { reloadUserInfo?: { screenName?: string } })
        ?.reloadUserInfo?.screenName
      commit('setUserCredentials', {
        user: { uid, emailVerified },
        _tokenResponse: {
          displayName: displayName || screenName,
          photoUrl,
          email,
          providerId: currentProvider,
          rawUserInfo: null
        }
      })

      // Always exchange for a fresh platform JWT on session restore.
      // The cached vitrina_jwt may be expired, and views fire API calls immediately.
      const success = (await dispatch('refreshPlatformJwt')) as boolean
      if (!success && localStorage.getItem('vitrina_jwt')) {
        // Refresh failed but we have a cached JWT: keep it and hope it's still valid
        commit('setIsLogged', true)
      }
    }
  },
  modules: {}
})
