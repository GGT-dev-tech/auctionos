import re

with open("frontend/layouts/ClientLayout.tsx", "r") as f:
    content = f.read()

# Replacement for Desktop Trial
desktop_old = """              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Trial</span>
                <Link
                  to="/signup"
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                  Upgrade Trial
                </Link>
              </div>"""

desktop_new = """              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${user?.subscription_tier === 'enterprise' ? 'bg-purple-500' : user?.subscription_tier === 'pro' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{user?.subscription_tier || 'Trial'}</span>
                {user?.subscription_tier === 'trial' && (
                  <Link
                    to="/signup"
                    className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    Upgrade Trial
                  </Link>
                )}
              </div>"""

# Replacement for Mobile Trial
mobile_old = """              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-base font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                Upgrade Trial Account
              </Link>"""

mobile_new = """              {user?.subscription_tier === 'trial' && (
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-base font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  Upgrade Trial Account
                </Link>
              )}"""

if desktop_old in content:
    content = content.replace(desktop_old, desktop_new)
    print("Replaced desktop block")
else:
    print("Could not find desktop block")

if mobile_old in content:
    content = content.replace(mobile_old, mobile_new)
    print("Replaced mobile block")
else:
    print("Could not find mobile block")

with open("frontend/layouts/ClientLayout.tsx", "w") as f:
    f.write(content)
