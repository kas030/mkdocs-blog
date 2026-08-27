#include <bits/stdc++.h>
using namespace std;
void solve() {
    int n;
    cin >> n;
    vector<int> v(n + 1);
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        v[x]++;
    }
    int p;
    vector<int> b(n + 1);
    for (p = 0; p <= n; p++) {
        if (!v[p]) break;
        b[v[p]]++;
    }
    for (int i = 1; i <= n; i++) {
        b[i] += b[i - 1];
    }
    int u = n - p;

    cout << "1";
    for (int k = 1; k <= n; k++) {
        cout << ' ';
        int tmp = u - k;
        if (tmp >= 0) {
            cout << b[k] + 1;
        } else {
            cout << n - k + 1;
        }
    }
    cout << '\n';
}
int main() {
    cin.tie(0)->sync_with_stdio(0);
    int t;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}