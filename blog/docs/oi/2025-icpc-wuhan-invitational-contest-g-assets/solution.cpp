#include <bits/stdc++.h>
using namespace std;
constexpr int MOD = 998244353;
using ll = long long;
struct pos {
    int x, y;
};
inline void md(auto &x) {
    x %= MOD;
}
inline void subm(auto &x, auto y) {
    x -= y % MOD;
    x += MOD;
    x %= MOD;
}
inline void addm(auto &x, auto y) {
    x += y;
    x %= MOD;
}
void solve() {
    int n, m;
    cin >> n >> m;
    vector a(n + 1, vector<int>(m + 1));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            cin >> a[i][j];
        }
    }

    vector pre(n + 1, vector<ll>(m + 1));
    pre[1][1] = 1;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            pre[i][j] += pre[i - 1][j] + pre[i][j - 1];
            md(pre[i][j]);
        }
    }

    vector v(n * m + 1, vector<pos>());
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            v[a[i][j]].push_back({i, j});
        }
    }

    ll ans{};

    int th = sqrt(n * m);
    for (int num = 1; num <= n * m; num++) {
        if (v[num].empty()) continue;
        int cnt = v[num].size();
        if (cnt <= th) {
            vector<ll> res(cnt);
            for (int j = 0; j < cnt; j++) {
                auto [x1, y1] = v[num][j];
                res[j] += pre[x1][y1];
                for (int k = 0; k < cnt; k++) {
                    if (j == k) continue;
                    auto [x2, y2] = v[num][k];
                    if (x2 > x1) break;
                    if (y2 > y1) continue;
                    subm(res[j], res[k] * pre[x1 - x2 + 1][y1 - y2 + 1]);
                }

                addm(ans, res[j] * pre[n - x1 + 1][m - y1 + 1]);
            }
        } else {
            if (a[1][1] == num) {
                addm(ans, pre[n][m]);
                continue;
            }
            vector dp(n + 1, vector<ll>(m + 1));
            if (a[1][1] != num) dp[1][1] = 1;
            for (int j = 1; j <= n; j++) {
                for (int k = 1; k <= m; k++) {
                    if (a[j][k] != num) {
                        addm(dp[j][k], dp[j - 1][k] + dp[j][k - 1]);
                    }
                }
            }
            ll tmp{pre[n][m]};
            subm(tmp, dp[n][m]);
            addm(ans, tmp);
        }
    }
    cout << ans << '\n';
}
int main() {
    cin.tie(nullptr)->sync_with_stdio(0);
    int t;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}